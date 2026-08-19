import { eq, sql } from "drizzle-orm";
import { Directory, File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { zip, unzip } from "react-native-zip-archive";
import { getDb, SCHEMA_VERSION } from "@/db/client";
import { applySeed, SEED_VERSION } from "@/db/seed";
import { settings } from "@/db/schema";
import { generateId } from "@/lib/id";
import { imagesDir } from "@/lib/images";
import { syncWidget } from "@/lib/widget";
import { getAppVersion } from "@/utils/version";
import {
  BACKUP_FORMAT,
  BACKUP_TABLES,
  BackupError,
  imageFileName,
  parseBackupData,
  reviveRow,
  rewriteImageUri,
  validateManifest,
  type BackupData,
  type BackupManifest,
} from "./backupData";

/** Matches the seeder's chunk size — well under SQLite's variable limit. */
const CHUNK = 50;

/** react-native-zip-archive wants plain paths, not file:// URIs. */
const toPath = (uri: string): string =>
  decodeURIComponent(uri.replace(/^file:\/\//, ""));

/** Overwrite on collision: restoring onto the source device reuses names. */
const copyFilesInto = (from: Directory, to: Directory): void => {
  if (!to.exists) to.create({ intermediates: true });
  for (const entry of from.list()) {
    if (entry instanceof File) {
      entry.copy(new File(to, entry.name), { overwrite: true });
    }
  }
};

/**
 * Zip implementations differ on whether a zipped folder's contents land at the
 * archive root or nested one level down — accept both shapes.
 */
const findBackupRoot = (dir: Directory): Directory => {
  if (new File(dir, "manifest.json").exists) return dir;
  const subdirs = dir.list().filter((e) => e instanceof Directory);
  const sole = subdirs.length === 1 ? subdirs[0] : undefined;
  if (sole && new File(sole, "manifest.json").exists) return sole;
  return dir;
};

const deleteQuietly = (target: Directory | File): void => {
  try {
    if (target.exists) target.delete();
  } catch {
    // Temp-file cleanup must never surface as a backup failure.
  }
};

/**
 * Serializes the whole database plus the stored image files into a zip in the
 * cache directory and hands it to the iOS share sheet. The staged copies and
 * the archive are deleted once the sheet is dismissed.
 */
export const exportBackup = async (): Promise<void> => {
  const db = getDb();

  const data: Record<string, unknown[]> = {};
  for (const { name, table } of BACKUP_TABLES) {
    data[name] = await db.select().from(table);
  }

  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    appVersion: getAppVersion(),
    schemaVersion: SCHEMA_VERSION,
    seedVersion: SEED_VERSION,
    exportedAt: new Date().toISOString(),
  };

  const staging = new Directory(Paths.cache, `backup-export-${generateId()}`);
  const date = new Date().toISOString().slice(0, 10);
  const archive = new File(Paths.cache, `kitarchive-backup-${date}.zip`);
  try {
    staging.create({ intermediates: true });
    new File(staging, "manifest.json").write(JSON.stringify(manifest));
    new File(staging, "data.json").write(JSON.stringify(data));

    const images = imagesDir();
    if (images.exists) {
      copyFilesInto(images, new Directory(staging, "images"));
    }

    deleteQuietly(archive);
    await zip(toPath(staging.uri), toPath(archive.uri));

    await Sharing.shareAsync(archive.uri, {
      mimeType: "application/zip",
      UTI: "public.zip-archive",
    });
  } finally {
    deleteQuietly(staging);
    deleteQuietly(archive);
  }
};

/** Opens the document picker for a backup zip. Null when the user cancels. */
export const pickBackupFile = async (): Promise<string | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/zip",
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
};

const insertRows = async (
  db: ReturnType<typeof getDb>,
  data: BackupData,
): Promise<void> => {
  const imagesUri = imagesDir().uri;
  for (const def of BACKUP_TABLES) {
    const rows = data[def.name].map((raw) => {
      const row = reviveRow(raw, def.dateFields);
      if ("uriField" in def) {
        row[def.uriField] = rewriteImageUri(row[def.uriField], imagesUri);
      }
      return row;
    });
    for (let i = 0; i < rows.length; i += CHUNK) {
      await db.insert(def.table).values(rows.slice(i, i + CHUNK) as never);
    }
  }
};

/** Deletes stored image files no restored row references. */
const deleteOrphanedImages = (data: BackupData): void => {
  try {
    const referenced = new Set<string>();
    for (const def of BACKUP_TABLES) {
      if (!("uriField" in def)) continue;
      for (const row of data[def.name]) {
        const name = imageFileName(row[def.uriField]);
        if (name) referenced.add(name);
      }
    }
    const images = imagesDir();
    if (!images.exists) return;
    for (const entry of images.list()) {
      if (entry instanceof File && !referenced.has(entry.name)) entry.delete();
    }
  } catch {
    // Orphaned files waste space but never break a completed restore.
  }
};

/**
 * Restores a backup archive, replacing the entire database. Image files are
 * copied in before the DB transaction (filenames are unique ids, so this is
 * purely additive); the wipe-and-reinsert runs in one transaction so a failed
 * restore leaves the previous data untouched; orphaned image files are swept
 * afterwards. Drizzle's expo-sqlite transaction() commits before an async
 * callback resolves, so BEGIN/COMMIT/ROLLBACK are issued manually — safe here
 * because the driver executes awaited statements synchronously and in order.
 */
export const importBackup = async (archiveUri: string): Promise<void> => {
  const extractDir = new Directory(
    Paths.cache,
    `backup-import-${generateId()}`,
  );
  try {
    extractDir.create({ intermediates: true });
    try {
      await unzip(toPath(archiveUri), toPath(extractDir.uri));
    } catch {
      throw new BackupError("invalid", "Archive could not be unzipped");
    }

    const root = findBackupRoot(extractDir);
    const manifestFile = new File(root, "manifest.json");
    const dataFile = new File(root, "data.json");
    if (!manifestFile.exists || !dataFile.exists) {
      throw new BackupError("invalid", "Archive is missing manifest or data");
    }

    let manifestJson: unknown;
    try {
      manifestJson = JSON.parse(await manifestFile.text());
    } catch {
      throw new BackupError("invalid", "manifest.json is not valid JSON");
    }
    const manifest = validateManifest(manifestJson, {
      format: BACKUP_FORMAT,
      schemaVersion: SCHEMA_VERSION,
    });
    const data = parseBackupData(await dataFile.text());

    if (data.settings.length === 0) {
      data.settings = [
        {
          id: "default",
          onboardingCompleted: true,
          seedVersion: manifest.seedVersion,
        },
      ];
    }

    const extractedImages = new Directory(root, "images");
    if (extractedImages.exists) copyFilesInto(extractedImages, imagesDir());

    const db = getDb();
    const currentSettings = await db
      .select({ language: settings.language })
      .from(settings)
      .where(eq(settings.id, "default"))
      .limit(1);

    db.run(sql`begin`);
    try {
      for (let i = BACKUP_TABLES.length - 1; i >= 0; i -= 1) {
        const def = BACKUP_TABLES[i];
        if (def) await db.delete(def.table);
      }
      await insertRows(db, data);
      // Language is a device preference, not collection data — keep it.
      const language = currentSettings[0]?.language;
      if (language) {
        await db
          .update(settings)
          .set({ language, updatedAt: new Date() })
          .where(eq(settings.id, "default"));
      }
      db.run(sql`commit`);
    } catch (error) {
      db.run(sql`rollback`);
      throw error;
    }

    deleteOrphanedImages(data);

    // Re-add any seed rows newer than the backup (insert-only, so restored
    // user edits to seed rows are preserved).
    await applySeed(db);
    await syncWidget();
  } finally {
    deleteQuietly(extractDir);
  }
};

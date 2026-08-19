import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import * as schema from "@/db/schema";

/**
 * Pure (IO-free) half of backup & restore: archive format, table registry,
 * manifest validation and row revival. The IO half lives in backupService.ts.
 *
 * Archive layout: a zip containing manifest.json, data.json and an images/
 * folder mirroring <documents>/images. data.json holds every table — not just
 * source:'user' rows — because the seeder is insert-only: in-app corrections
 * to seed rows only survive a restore if the backup carries them.
 */

/** Bump when the archive layout itself changes shape. */
export const BACKUP_FORMAT = 1;

export interface BackupManifest {
  format: number;
  appVersion: string;
  schemaVersion: number;
  seedVersion: number;
  exportedAt: string;
}

export type BackupErrorCode = "invalid" | "newer";

/** Import failures the UI maps to specific messages. */
export class BackupError extends Error {
  readonly code: BackupErrorCode;

  constructor(code: BackupErrorCode, message?: string) {
    super(message ?? `Backup error: ${code}`);
    this.name = "BackupError";
    this.code = code;
  }
}

interface BackupTableDef {
  name: string;
  table: SQLiteTable;
  /** timestamp-mode columns — ISO strings in the archive, Dates in Drizzle. */
  dateFields: readonly string[];
  /** Column holding a stored file:// image URI that must be rewritten. */
  uriField?: string;
}

/**
 * Every persisted table, ordered parent-first: import inserts in this order
 * and wipes in reverse, so foreign keys hold at every step.
 */
export const BACKUP_TABLES = [
  { name: "countries", table: schema.countries, dateFields: [] },
  { name: "manufacturers", table: schema.manufacturers, dateFields: [] },
  { name: "competitions", table: schema.competitions, dateFields: [] },
  { name: "players", table: schema.players, dateFields: [] },
  { name: "addons", table: schema.addons, dateFields: [] },
  {
    name: "teams",
    table: schema.teams,
    dateFields: ["createdAt", "updatedAt"],
    uriField: "logoUri",
  },
  { name: "eras", table: schema.eras, dateFields: [] },
  { name: "kits", table: schema.kits, dateFields: ["createdAt", "updatedAt"] },
  { name: "kitCompetitions", table: schema.kitCompetitions, dateFields: [] },
  {
    name: "kitImages",
    table: schema.kitImages,
    dateFields: ["createdAt"],
    uriField: "uri",
  },
  {
    name: "collectionItems",
    table: schema.collectionItems,
    dateFields: ["purchaseDate", "createdAt", "updatedAt"],
  },
  { name: "itemAddons", table: schema.itemAddons, dateFields: [] },
  {
    name: "itemPhotos",
    table: schema.itemPhotos,
    dateFields: ["createdAt"],
    uriField: "uri",
  },
  {
    name: "wishlistItems",
    table: schema.wishlistItems,
    dateFields: ["createdAt"],
  },
  { name: "settings", table: schema.settings, dateFields: ["updatedAt"] },
] as const satisfies readonly BackupTableDef[];

export type BackupTableName = (typeof BACKUP_TABLES)[number]["name"];

export type BackupData = Record<BackupTableName, Record<string, unknown>[]>;

interface CurrentVersions {
  format: number;
  schemaVersion: number;
}

/** Throws BackupError('invalid' | 'newer'); returns the typed manifest. */
export const validateManifest = (
  value: unknown,
  current: CurrentVersions,
): BackupManifest => {
  if (typeof value !== "object" || value === null) {
    throw new BackupError("invalid", "Manifest is not an object");
  }
  const m = value as Partial<BackupManifest>;
  if (
    typeof m.format !== "number" ||
    typeof m.schemaVersion !== "number" ||
    typeof m.seedVersion !== "number"
  ) {
    throw new BackupError("invalid", "Manifest is missing version fields");
  }
  if (m.format > current.format || m.schemaVersion > current.schemaVersion) {
    throw new BackupError("newer");
  }
  return {
    format: m.format,
    appVersion: typeof m.appVersion === "string" ? m.appVersion : "unknown",
    schemaVersion: m.schemaVersion,
    seedVersion: m.seedVersion,
    exportedAt: typeof m.exportedAt === "string" ? m.exportedAt : "",
  };
};

/**
 * Parses data.json. Tolerant of missing tables (older archives) — they come
 * back as empty arrays; unknown extra tables are ignored.
 */
export const parseBackupData = (json: string): BackupData => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new BackupError("invalid", "data.json is not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new BackupError("invalid", "data.json is not an object");
  }
  const source = parsed as Record<string, unknown>;
  const data = {} as BackupData;
  for (const { name } of BACKUP_TABLES) {
    const rows = source[name];
    if (rows !== undefined && !Array.isArray(rows)) {
      throw new BackupError("invalid", `Table ${name} is not an array`);
    }
    data[name] = (rows ?? []) as Record<string, unknown>[];
  }
  return data;
};

/** Converts serialized timestamps (ISO strings / epoch ms) back to Dates. */
export const reviveRow = (
  row: Record<string, unknown>,
  dateFields: readonly string[],
): Record<string, unknown> => {
  if (dateFields.length === 0) return row;
  const revived = { ...row };
  for (const field of dateFields) {
    const value = revived[field];
    if (value === null || value === undefined) continue;
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new BackupError("invalid", `Bad timestamp in ${field}`);
      }
      revived[field] = date;
    }
  }
  return revived;
};

// Restored URIs are re-rooted with the shared helpers — see lib/imageUri.ts.
export { imageFileName, rewriteImageUri } from "@/lib/imageUri";

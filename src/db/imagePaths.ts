import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { itemPhotos, kitImages, teams } from "@/db/schema";
import { imagesDir } from "@/lib/images";
import { rewriteImageUri } from "@/lib/imageUri";

type Db = ExpoSQLiteDatabase<Record<string, unknown>>;

/**
 * Re-roots stored photo/reference-image URIs onto the current images
 * directory. The DB stores absolute file:// URIs, and iOS changes the app
 * container UUID on reinstall/update — the files survive in Documents, but
 * every stored pointer goes stale and images silently render blank. Runs at
 * startup; a no-op (reads only) when nothing has drifted.
 */
export const normalizeImageUris = async (db: Db): Promise<void> => {
  const dirUri = imagesDir().uri;

  const photos = await db
    .select({ id: itemPhotos.id, uri: itemPhotos.uri })
    .from(itemPhotos);
  for (const row of photos) {
    const next = rewriteImageUri(row.uri, dirUri);
    if (typeof next === "string" && next !== row.uri) {
      await db
        .update(itemPhotos)
        .set({ uri: next })
        .where(eq(itemPhotos.id, row.id));
    }
  }

  const images = await db
    .select({ id: kitImages.id, uri: kitImages.uri })
    .from(kitImages);
  for (const row of images) {
    const next = rewriteImageUri(row.uri, dirUri);
    if (typeof next === "string" && next !== row.uri) {
      await db
        .update(kitImages)
        .set({ uri: next })
        .where(eq(kitImages.id, row.id));
    }
  }

  const teamLogos = await db
    .select({ id: teams.id, logoUri: teams.logoUri })
    .from(teams);
  for (const row of teamLogos) {
    const next = rewriteImageUri(row.logoUri, dirUri);
    if (typeof next === "string" && next !== row.logoUri) {
      await db.update(teams).set({ logoUri: next }).where(eq(teams.id, row.id));
    }
  }
};

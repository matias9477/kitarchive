import { Directory, File, Paths } from "expo-file-system";
import { generateId } from "@/lib/id";

/**
 * Picked images (item photos, kit reference images) are copied into the app's
 * document directory so they survive the picker cache being purged. The DB
 * stores the resulting file:// URI.
 */

const imagesDir = () => new Directory(Paths.document, "images");

export const persistPickedImage = async (
  sourceUri: string,
): Promise<string> => {
  const dir = imagesDir();
  if (!dir.exists) dir.create({ intermediates: true });
  const rawExt = sourceUri.split(".").pop() ?? "";
  const ext = /^[a-zA-Z0-9]{2,5}$/.test(rawExt) ? rawExt.toLowerCase() : "jpg";
  const dest = new File(dir, `${generateId()}.${ext}`);
  new File(sourceUri).copy(dest);
  return dest.uri;
};

/** Deletes a stored image file. No-op for URIs we don't own. */
export const deleteStoredImage = async (uri: string): Promise<void> => {
  try {
    if (!uri.startsWith(imagesDir().uri)) return;
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Never let file cleanup break a DB operation.
  }
};

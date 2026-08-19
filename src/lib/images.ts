import { Directory, File, Paths } from "expo-file-system";
import { generateId } from "@/lib/id";

/**
 * Picked images (item photos, kit reference images) are copied into the app's
 * document directory so they survive the picker cache being purged. The DB
 * stores the resulting file:// URI.
 */

export const imagesDir = () => new Directory(Paths.document, "images");

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

const extFromUrl = (url: string): string => {
  const path = url.split(/[?#]/)[0] ?? "";
  const rawExt = path.split(".").pop() ?? "";
  return /^(jpe?g|png|webp|gif|heic)$/i.test(rawExt)
    ? rawExt.toLowerCase()
    : "jpg";
};

/**
 * Persist an image picked from the web (https URL or data URI) into the app
 * documents dir, mirroring persistPickedImage. Throws on download failure —
 * callers surface that as "try another image".
 */
export const persistRemoteImage = async (src: string): Promise<string> => {
  const dir = imagesDir();
  if (!dir.exists) dir.create({ intermediates: true });

  const dataMatch = /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/.exec(src);
  if (dataMatch) {
    const [, mime = "jpeg", base64 = ""] = dataMatch;
    const ext = mime === "jpeg" ? "jpg" : mime.replace(/[^a-z0-9]/gi, "");
    const dest = new File(dir, `${generateId()}.${ext}`);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    dest.write(bytes);
    return dest.uri;
  }

  if (/^https?:\/\//.test(src)) {
    const dest = new File(dir, `${generateId()}.${extFromUrl(src)}`);
    await File.downloadFileAsync(src, dest);
    return dest.uri;
  }

  throw new Error(`Unsupported image source: ${src.slice(0, 40)}`);
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

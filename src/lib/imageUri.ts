/**
 * Pure helpers for stored image URIs. Photos live as files in
 * <documents>/images and the DB stores absolute file:// URIs — but iOS
 * changes the app container UUID on reinstall/update, so stored URIs must be
 * re-rooted onto the current images directory before use (startup heal in
 * db/imagePaths.ts, backup restore in features/settings).
 */

/**
 * Re-roots an owned image URI onto the given images directory. URIs we don't
 * own (no /images/ segment, non-file scheme) pass through untouched.
 */
export const rewriteImageUri = (
  uri: unknown,
  imagesDirUri: string,
): unknown => {
  if (typeof uri !== "string" || !uri.startsWith("file:")) return uri;
  const marker = "/images/";
  const index = uri.lastIndexOf(marker);
  if (index === -1) return uri;
  const name = uri.slice(index + marker.length);
  if (!name || name.includes("/")) return uri;
  const base = imagesDirUri.endsWith("/") ? imagesDirUri : `${imagesDirUri}/`;
  return `${base}${name}`;
};

/** Last path segment of a stored image URI, or null if it isn't one of ours. */
export const imageFileName = (uri: unknown): string | null => {
  if (typeof uri !== "string") return null;
  const name = uri.split("/").pop();
  return name ? name : null;
};

/**
 * Helpers for the "pick a kit image from Google" flow: the WebView loads
 * Google Images, injected JS reports tapped images, and the screen persists
 * the chosen one. Pure functions live here so they're unit-testable.
 */

export interface WebImageSelection {
  src: string;
  width: number;
  height: number;
}

/** Google Images search URL (udm=2 is the images tab). */
export const googleImagesUrl = (query: string): string =>
  `https://www.google.com/search?udm=2&q=${encodeURIComponent(query)}`;

/**
 * Injected into the WebView: report every tapped <img> that has real content
 * (thumbnails and the enlarged preview alike — the user's last tap wins).
 * Navigation is not prevented, so tapping a thumbnail still opens Google's
 * larger preview, which can then be tapped to select the higher-res version.
 */
export const WEB_IMAGE_CLICK_SCRIPT = `
(function () {
  if (window.__kitarchiveImagePicker) return;
  window.__kitarchiveImagePicker = true;
  document.addEventListener(
    "click",
    function (event) {
      var el = event.target;
      while (el && el.tagName !== "IMG") el = el.parentElement;
      if (!el || !el.src) return;
      var width = el.naturalWidth || 0;
      var height = el.naturalHeight || 0;
      if (width < 80 || height < 80) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ src: el.src, width: width, height: height })
      );
    },
    true
  );
})();
true;
`;

/** Parse and validate a message posted by WEB_IMAGE_CLICK_SCRIPT. */
export const parseWebImageMessage = (raw: string): WebImageSelection | null => {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { src, width, height } = data as Record<string, unknown>;
    if (typeof src !== "string") return null;
    if (!/^https?:\/\//.test(src) && !src.startsWith("data:image/"))
      return null;
    return {
      src,
      width: typeof width === "number" ? width : 0,
      height: typeof height === "number" ? height : 0,
    };
  } catch {
    return null;
  }
};

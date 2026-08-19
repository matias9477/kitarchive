/**
 * Helpers for the "pick a kit image from Google" flow: the WebView loads
 * Google Images, injected JS reports tapped images, and the screen persists
 * the chosen one. Pure functions live here so they're unit-testable.
 */

export interface WebImageSelection {
  src: string;
  width: number;
  height: number;
  /** True when posted by WEB_IMAGE_AUTO_SCRIPT rather than a user tap. */
  auto: boolean;
}

/** Google Images search URL (udm=2 is the images tab). */
export const googleImagesUrl = (query: string): string =>
  `https://www.google.com/search?udm=2&q=${encodeURIComponent(query)}`;

/**
 * Search query for a kit's imagery: team + season + kit type pin down the
 * design, the manufacturer (when known) disambiguates re-issues and template
 * years, and the localized "shirt" suffix keeps results on shirts.
 */
export const kitImageQuery = (parts: {
  teamName: string;
  eraLabel: string;
  kitTypeLabel: string;
  manufacturerName?: string | null;
  suffix: string;
}): string =>
  [
    parts.teamName,
    parts.eraLabel,
    parts.kitTypeLabel,
    parts.manufacturerName,
    parts.suffix,
  ]
    .filter(Boolean)
    .join(" ");

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

/**
 * Injected alongside the click script for the "Auto search" flow: waits for
 * the results grid, taps the first real thumbnail so Google loads its larger
 * preview, and posts the preview (falling back to the thumbnail) exactly
 * once, marked with `auto: true`. Sponsored/shopping results are skipped —
 * they rank first but show whatever is on sale now, not the searched kit.
 * Best-effort by design — if Google's markup defeats it, it posts nothing
 * and the screen falls back to manual picking.
 */
export const WEB_IMAGE_AUTO_SCRIPT = `
(function () {
  if (window.__kitarchiveAutoPick) return;
  window.__kitarchiveAutoPick = true;
  var posted = false;
  function post(img) {
    if (posted) return;
    posted = true;
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        src: img.src,
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0,
        auto: true
      })
    );
  }
  function isAd(img) {
    // Shopping-ad images are served from gstatic's /shopping endpoint
    // (organic thumbnails use /images?q=tbn).
    if (/gstatic\\.com\\/shopping/.test(img.src)) return true;
    // Ad tiles link through Google's ad-click redirect.
    var link = img.closest ? img.closest("a") : null;
    var href = (link && link.href) || "";
    if (href.indexOf("aclk") !== -1 || href.indexOf("googleadservices") !== -1)
      return true;
    // Explicit ad containers / localized "Sponsored" labels up the tree.
    var el = img;
    for (var depth = 0; el && depth < 10; depth++) {
      if (el.hasAttribute) {
        if (el.hasAttribute("data-text-ad") || el.hasAttribute("data-ad"))
          return true;
        var label = el.getAttribute("aria-label") || "";
        if (/sponsored|patrocinado|anuncio/i.test(label)) return true;
      }
      el = el.parentElement;
    }
    return false;
  }
  function isThumb(img) {
    if (!img || !img.src) return false;
    if (!/^https?:/.test(img.src) && img.src.indexOf("data:image/") !== 0)
      return false;
    var w = img.naturalWidth || 0;
    var h = img.naturalHeight || 0;
    return w >= 100 && h >= 100;
  }
  function firstThumb() {
    var imgs = document.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      if (isThumb(imgs[i]) && !isAd(imgs[i])) return imgs[i];
    }
    return null;
  }
  var findTries = 0;
  var findTimer = setInterval(function () {
    findTries++;
    var thumb = firstThumb();
    if (!thumb) {
      if (findTries >= 20) clearInterval(findTimer);
      return;
    }
    clearInterval(findTimer);
    var thumbSrc = thumb.src;
    try { thumb.click(); } catch (e) {}
    var upgradeTries = 0;
    var upgradeTimer = setInterval(function () {
      upgradeTries++;
      var imgs = document.querySelectorAll("img");
      for (var i = 0; i < imgs.length; i++) {
        var candidate = imgs[i];
        if (!candidate || !candidate.src || candidate.src === thumbSrc)
          continue;
        if (!/^https?:/.test(candidate.src)) continue;
        if (isAd(candidate)) continue;
        if (
          (candidate.naturalWidth || 0) >= 300 &&
          (candidate.naturalHeight || 0) >= 300
        ) {
          clearInterval(upgradeTimer);
          post(candidate);
          return;
        }
      }
      if (upgradeTries >= 10) {
        clearInterval(upgradeTimer);
        post(thumb);
      }
    }, 400);
  }, 400);
})();
true;
`;

/** Parse and validate a message posted by the injected scripts. */
export const parseWebImageMessage = (raw: string): WebImageSelection | null => {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { src, width, height, auto } = data as Record<string, unknown>;
    if (typeof src !== "string") return null;
    if (!/^https?:\/\//.test(src) && !src.startsWith("data:image/"))
      return null;
    return {
      src,
      width: typeof width === "number" ? width : 0,
      height: typeof height === "number" ? height : 0,
      auto: auto === true,
    };
  } catch {
    return null;
  }
};

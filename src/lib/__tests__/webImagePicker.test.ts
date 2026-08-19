import {
  WEB_IMAGE_AUTO_SCRIPT,
  WEB_IMAGE_CLICK_SCRIPT,
  googleImagesUrl,
  kitImageQuery,
  parseWebImageMessage,
} from "../webImagePicker";

describe("googleImagesUrl", () => {
  it("targets the Google Images tab and encodes the query", () => {
    const url = googleImagesUrl("Boca Juniors 2003/04 home shirt");
    expect(url).toContain("udm=2");
    expect(url).toContain("q=Boca%20Juniors%202003%2F04%20home%20shirt");
  });
});

describe("kitImageQuery", () => {
  it("joins team, era, type, manufacturer and suffix", () => {
    expect(
      kitImageQuery({
        teamName: "Boca Juniors",
        eraLabel: "2003/04",
        kitTypeLabel: "Home",
        manufacturerName: "Nike",
        suffix: "shirt",
      }),
    ).toBe("Boca Juniors 2003/04 Home Nike shirt");
  });

  it("omits the manufacturer when unknown", () => {
    expect(
      kitImageQuery({
        teamName: "Argentina",
        eraLabel: "2022",
        kitTypeLabel: "Home",
        manufacturerName: null,
        suffix: "shirt",
      }),
    ).toBe("Argentina 2022 Home shirt");
  });
});

describe("WEB_IMAGE_CLICK_SCRIPT", () => {
  it("is syntactically valid JavaScript", () => {
    expect(() => new Function(WEB_IMAGE_CLICK_SCRIPT)).not.toThrow();
  });

  it("posts selections through the WebView bridge", () => {
    expect(WEB_IMAGE_CLICK_SCRIPT).toContain(
      "window.ReactNativeWebView.postMessage",
    );
  });
});

describe("WEB_IMAGE_AUTO_SCRIPT", () => {
  it("is syntactically valid JavaScript, alone and appended", () => {
    expect(() => new Function(WEB_IMAGE_AUTO_SCRIPT)).not.toThrow();
    expect(
      () => new Function(WEB_IMAGE_CLICK_SCRIPT + WEB_IMAGE_AUTO_SCRIPT),
    ).not.toThrow();
  });

  it("marks its selections as auto", () => {
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("auto: true");
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain(
      "window.ReactNativeWebView.postMessage",
    );
  });

  it("guards against posting more than once", () => {
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("if (posted) return;");
  });

  it("skips sponsored/shopping results on every signal we know", () => {
    // gstatic shopping image host (regex must survive template-literal escaping)
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("gstatic\\.com\\/shopping");
    // ad-click redirect links
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("aclk");
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("googleadservices");
    // explicit ad containers and localized "Sponsored" labels
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("data-text-ad");
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("sponsored|patrocinado|anuncio");
    // the filter is applied in both the grid scan and the preview upgrade
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("&& !isAd(imgs[i])");
    expect(WEB_IMAGE_AUTO_SCRIPT).toContain("if (isAd(candidate)) continue;");
  });
});

describe("parseWebImageMessage", () => {
  it("accepts https image selections", () => {
    const raw = JSON.stringify({
      src: "https://example.com/shirt.jpg",
      width: 640,
      height: 800,
    });
    expect(parseWebImageMessage(raw)).toEqual({
      src: "https://example.com/shirt.jpg",
      width: 640,
      height: 800,
      auto: false,
    });
  });

  it("accepts base64 data-URI thumbnails (Google's grid images)", () => {
    const raw = JSON.stringify({ src: "data:image/jpeg;base64,AAAA" });
    expect(parseWebImageMessage(raw)).toEqual({
      src: "data:image/jpeg;base64,AAAA",
      width: 0,
      height: 0,
      auto: false,
    });
  });

  it("carries the auto flag through, defaulting anything odd to false", () => {
    const auto = JSON.stringify({
      src: "https://example.com/shirt.jpg",
      auto: true,
    });
    expect(parseWebImageMessage(auto)?.auto).toBe(true);
    const odd = JSON.stringify({
      src: "https://example.com/shirt.jpg",
      auto: "yes",
    });
    expect(parseWebImageMessage(odd)?.auto).toBe(false);
  });

  it("rejects unsafe or malformed payloads", () => {
    expect(parseWebImageMessage("not json")).toBeNull();
    expect(parseWebImageMessage(JSON.stringify({ width: 10 }))).toBeNull();
    expect(
      parseWebImageMessage(JSON.stringify({ src: "javascript:alert(1)" })),
    ).toBeNull();
    expect(
      parseWebImageMessage(JSON.stringify({ src: "data:text/html,<b>x</b>" })),
    ).toBeNull();
    expect(parseWebImageMessage("null")).toBeNull();
  });
});

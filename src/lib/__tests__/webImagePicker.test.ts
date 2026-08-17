import {
  WEB_IMAGE_CLICK_SCRIPT,
  googleImagesUrl,
  parseWebImageMessage,
} from "../webImagePicker";

describe("googleImagesUrl", () => {
  it("targets the Google Images tab and encodes the query", () => {
    const url = googleImagesUrl("Boca Juniors 2003/04 home shirt");
    expect(url).toContain("udm=2");
    expect(url).toContain("q=Boca%20Juniors%202003%2F04%20home%20shirt");
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
    });
  });

  it("accepts base64 data-URI thumbnails (Google's grid images)", () => {
    const raw = JSON.stringify({ src: "data:image/jpeg;base64,AAAA" });
    expect(parseWebImageMessage(raw)).toEqual({
      src: "data:image/jpeg;base64,AAAA",
      width: 0,
      height: 0,
    });
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

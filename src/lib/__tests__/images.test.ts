const mockCopy = jest.fn();
const mockWrite = jest.fn();
const mockDownload = jest.fn();

jest.mock("expo-file-system", () => {
  class MockDirectory {
    uri: string;
    exists = true;
    create = jest.fn();
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts
        .map((p) => (typeof p === "string" ? p : p.uri))
        .join("/");
    }
  }
  class MockFile {
    // Deferred: the factory runs before top-level consts are initialized.
    static downloadFileAsync = (...args: unknown[]) => mockDownload(...args);
    uri: string;
    exists = true;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts
        .map((p) => (typeof p === "string" ? p : p.uri))
        .join("/");
    }
    copy = mockCopy;
    write = mockWrite;
    delete = jest.fn();
  }
  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: "file:///docs" },
  };
});

import { persistPickedImage, persistRemoteImage } from "../images";

beforeEach(() => jest.clearAllMocks());

describe("persistPickedImage (camera / gallery)", () => {
  it("copies into the images dir keeping the extension", async () => {
    const uri = await persistPickedImage("file:///cache/IMG_0001.HEIC");
    expect(uri).toMatch(/^file:\/\/\/docs\/images\/.+\.heic$/);
    expect(mockCopy).toHaveBeenCalledTimes(1);
  });

  it("defaults to jpg when the source has no usable extension", async () => {
    const uri = await persistPickedImage("file:///cache/picked-image");
    expect(uri).toMatch(/\.jpg$/);
  });
});

describe("persistRemoteImage (web picker)", () => {
  it("decodes and writes base64 data URIs", async () => {
    const base64 = Buffer.from("fake-png-bytes").toString("base64");
    const uri = await persistRemoteImage(`data:image/png;base64,${base64}`);
    expect(uri).toMatch(/^file:\/\/\/docs\/images\/.+\.png$/);
    expect(mockWrite).toHaveBeenCalledTimes(1);
    const bytes = mockWrite.mock.calls[0]?.[0] as Uint8Array;
    expect(Buffer.from(bytes).toString()).toBe("fake-png-bytes");
    expect(mockDownload).not.toHaveBeenCalled();
  });

  it("maps image/jpeg data URIs to a .jpg file", async () => {
    const uri = await persistRemoteImage(
      `data:image/jpeg;base64,${Buffer.from("x").toString("base64")}`,
    );
    expect(uri).toMatch(/\.jpg$/);
  });

  it("downloads https URLs, keeping a sane extension", async () => {
    const url = "https://example.com/kits/boca-2003.png?w=800#frag";
    const uri = await persistRemoteImage(url);
    expect(uri).toMatch(/^file:\/\/\/docs\/images\/.+\.png$/);
    expect(mockDownload).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ uri }),
    );
  });

  it("falls back to .jpg for extension-less URLs", async () => {
    const uri = await persistRemoteImage("https://example.com/image");
    expect(uri).toMatch(/\.jpg$/);
  });

  it("propagates download failures", async () => {
    mockDownload.mockRejectedValueOnce(new Error("404"));
    await expect(
      persistRemoteImage("https://example.com/gone.jpg"),
    ).rejects.toThrow("404");
  });

  it("rejects non-http, non-data sources", async () => {
    await expect(persistRemoteImage("javascript:alert(1)")).rejects.toThrow(
      /Unsupported image source/,
    );
    await expect(persistRemoteImage("file:///etc/passwd")).rejects.toThrow(
      /Unsupported image source/,
    );
  });
});

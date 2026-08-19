import { deriveStartYear } from "../years";

describe("deriveStartYear", () => {
  it("takes the first 4-digit year in the label", () => {
    expect(deriveStartYear("2011/12")).toBe(2011);
    expect(deriveStartYear("1998-99")).toBe(1998);
    expect(deriveStartYear("Season 2023/2024")).toBe(2023);
  });

  it("returns null when there is no 4-digit year", () => {
    expect(deriveStartYear("Centenary")).toBeNull();
    expect(deriveStartYear("'98")).toBeNull();
    expect(deriveStartYear("")).toBeNull();
  });
});

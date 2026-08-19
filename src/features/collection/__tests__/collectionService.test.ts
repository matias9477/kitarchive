// expo-sqlite can't load under jest; the functions under test are pure.
jest.mock("@/db/client", () => ({ getDb: jest.fn() }));
jest.mock("@/lib/images", () => ({ deleteStoredImage: jest.fn() }));

import { buildItemRow, staggeredDate } from "../collectionService";

describe("buildItemRow", () => {
  const createdAt = new Date("2026-01-01T00:00:00Z");

  it("fills defaults for a minimal input", () => {
    const row = buildItemRow(
      { kitId: "kit-1", condition: "very_good" },
      createdAt,
    );
    expect(row.kitId).toBe("kit-1");
    expect(row.status).toBe("owned");
    expect(row.condition).toBe("very_good");
    expect(row.backType).toBe("blank");
    expect(row.createdAt).toBe(createdAt);
    expect(row.updatedAt).toBe(createdAt);
    expect(row.conditionNote).toBeNull();
    expect(row.productVersion).toBeNull();
    expect(row.edition).toBeNull();
    expect(row.sleeve).toBeNull();
    expect(row.playerId).toBeNull();
    expect(row.customName).toBeNull();
    expect(row.number).toBeNull();
    expect(row.purchaseDate).toBeNull();
    expect(row.seller).toBeNull();
    expect(row.purchasePrice).toBeNull();
    expect(row.currency).toBeNull();
  });

  it("passes optional fields through", () => {
    const row = buildItemRow(
      {
        kitId: "kit-1",
        condition: "good",
        backType: "player",
        number: 10,
        seller: "ebay",
      },
      createdAt,
    );
    expect(row.backType).toBe("player");
    expect(row.number).toBe(10);
    expect(row.seller).toBe("ebay");
  });

  it("generates a distinct id per row", () => {
    const ids = Array.from(
      { length: 20 },
      () => buildItemRow({ kitId: "k", condition: "good" }, createdAt).id,
    );
    expect(new Set(ids).size).toBe(20);
  });
});

describe("staggeredDate", () => {
  const nowMs = 1_750_000_000_000;

  it("spaces rows one second apart, ending at now", () => {
    const times = Array.from({ length: 5 }, (_, i) =>
      staggeredDate(nowMs, i, 5).getTime(),
    );
    expect(times[4]).toBe(nowMs);
    times.slice(1).forEach((time, i) => {
      expect(time - (times[i] ?? Number.NaN)).toBe(1000);
    });
    expect(times.every((time) => time <= nowMs)).toBe(true);
  });

  it("keeps distinct whole-second values after truncation", () => {
    const seconds = Array.from({ length: 25 }, (_, i) =>
      Math.floor(staggeredDate(nowMs, i, 25).getTime() / 1000),
    );
    expect(new Set(seconds).size).toBe(25);
  });
});

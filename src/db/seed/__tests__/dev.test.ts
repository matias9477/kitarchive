import { addonSeeds, playerSeeds } from "../core";
import { bocaKitSeeds } from "../boca";
import { argentinaKitSeeds } from "../argentina";
import { nationKitSeeds } from "../nations";
import { devItemAddonSeeds, devItemSeeds, devWishlistSeeds } from "../dev";

const kitIds = new Set(
  [...bocaKitSeeds, ...argentinaKitSeeds, ...nationKitSeeds].map((k) => k.id),
);
const playerIds = new Set(playerSeeds.map((p) => p.id));
const addonIds = new Set(addonSeeds.map((a) => a.id));

describe("dev seed integrity", () => {
  it("has unique item and wishlist ids", () => {
    for (const rows of [devItemSeeds, devWishlistSeeds]) {
      const ids = rows.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("items reference existing catalogue kits and players", () => {
    for (const item of devItemSeeds) {
      expect(kitIds).toContain(item.kitId);
      if (item.playerId) expect(playerIds).toContain(item.playerId);
    }
  });

  it("item addons reference existing items and addons", () => {
    const itemIds = new Set(devItemSeeds.map((i) => i.id));
    for (const link of devItemAddonSeeds) {
      expect(itemIds).toContain(link.itemId);
      expect(addonIds).toContain(link.addonId);
    }
  });

  it("wishlist entries reference existing kits and players, one per kit", () => {
    const wishKitIds = devWishlistSeeds.map((w) => w.kitId);
    expect(new Set(wishKitIds).size).toBe(wishKitIds.length);
    for (const wish of devWishlistSeeds) {
      expect(kitIds).toContain(wish.kitId);
      if (wish.playerId) expect(playerIds).toContain(wish.playerId);
    }
  });
});

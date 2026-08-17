import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";

/**
 * Fake user data for development: collection items, addons and wishlist
 * entries referencing catalogue seed rows. Applied from initializeDatabase()
 * only when __DEV__ AND both the collection and the wishlist are empty, so
 * deleting rows while testing sticks. Wipe the app (or delete kitarchive.db)
 * to get it back. Never ships: the __DEV__ guard compiles it out of release.
 *
 * Referential integrity against the catalogue seed is enforced by
 * __tests__/dev.test.ts — a broken FK here crashes app startup.
 */

type Db = ExpoSQLiteDatabase<typeof schema>;

type ItemSeed = typeof schema.collectionItems.$inferInsert;
type ItemAddonSeed = typeof schema.itemAddons.$inferInsert;
type WishlistSeed = typeof schema.wishlistItems.$inferInsert;

const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

export const devItemSeeds: ItemSeed[] = [
  {
    id: "dev-item-boca-2000-home",
    kitId: "boca-juniors-2000-01-home",
    condition: "excellent",
    productVersion: "original",
    edition: "player",
    sleeve: "short",
    backType: "player",
    playerId: "riquelme",
    number: 10,
    purchaseDate: day("2019-06-15"),
    seller: "classicfootballshirts.co.uk",
    purchasePrice: 250,
    currency: "USD",
    createdAt: day("2025-11-03"),
    updatedAt: day("2025-11-03"),
  },
  {
    id: "dev-item-boca-2003-home",
    kitId: "boca-juniors-2003-04-home",
    condition: "very_good",
    productVersion: "original",
    edition: "fan",
    sleeve: "short",
    backType: "player",
    playerId: "tevez",
    number: 32,
    purchaseDate: day("2023-11-02"),
    seller: "Mercado Libre",
    purchasePrice: 180000,
    currency: "ARS",
    createdAt: day("2025-12-18"),
    updatedAt: day("2025-12-18"),
  },
  {
    id: "dev-item-boca-2024-home",
    kitId: "boca-juniors-2024-25-home",
    condition: "deadstock",
    productVersion: "replica",
    edition: "fan",
    sleeve: "short",
    backType: "blank",
    purchaseDate: day("2024-08-20"),
    seller: "Adidas store",
    purchasePrice: 90,
    currency: "USD",
    createdAt: day("2026-02-09"),
    updatedAt: day("2026-02-09"),
  },
  {
    id: "dev-item-boca-2004-centenary",
    kitId: "boca-juniors-2004-05-special",
    condition: "good",
    conditionNote: "Small pull on the left sleeve.",
    productVersion: "original",
    edition: "fan",
    sleeve: "long",
    backType: "blank",
    purchaseDate: day("2021-03-11"),
    purchasePrice: 140,
    currency: "USD",
    createdAt: day("2026-01-27"),
    updatedAt: day("2026-01-27"),
  },
  {
    id: "dev-item-boca-1995-home",
    kitId: "boca-juniors-1995-96-home",
    condition: "poor",
    conditionNote: "Faded sponsor, cracked print on the back.",
    productVersion: "original",
    backType: "number_only",
    number: 9,
    purchaseDate: day("2020-09-05"),
    seller: "Mercado Libre",
    purchasePrice: 60000,
    currency: "ARS",
    createdAt: day("2025-10-12"),
    updatedAt: day("2025-10-12"),
  },
  {
    id: "dev-item-arg-2022-home",
    kitId: "argentina-2022-2023-home",
    condition: "deadstock",
    productVersion: "replica",
    edition: "fan",
    sleeve: "short",
    backType: "player",
    playerId: "messi",
    number: 10,
    purchaseDate: day("2022-12-20"),
    seller: "Adidas store",
    purchasePrice: 120,
    currency: "USD",
    createdAt: day("2026-03-14"),
    updatedAt: day("2026-03-14"),
  },
  {
    id: "dev-item-arg-1994-home",
    kitId: "argentina-1994-1995-home",
    condition: "fair",
    conditionNote: "Yellowed collar, era-typical wear.",
    productVersion: "original",
    edition: "fan",
    sleeve: "short",
    backType: "player",
    playerId: "batistuta",
    number: 9,
    purchaseDate: day("2018-04-22"),
    seller: "eBay",
    purchasePrice: 180,
    currency: "EUR",
    createdAt: day("2025-09-01"),
    updatedAt: day("2025-09-01"),
  },
  {
    id: "dev-item-arg-2024-away",
    kitId: "argentina-2024-2025-away",
    condition: "very_good",
    productVersion: "replica",
    edition: "fan",
    sleeve: "short",
    backType: "player",
    playerId: "di-maria",
    number: 11,
    purchaseDate: day("2024-07-15"),
    purchasePrice: 100,
    currency: "USD",
    createdAt: day("2026-04-02"),
    updatedAt: day("2026-04-02"),
  },
  {
    id: "dev-item-brazil-2022-home",
    kitId: "brazil-2022-2023-home",
    condition: "good",
    productVersion: "replica",
    edition: "fan",
    sleeve: "short",
    backType: "blank",
    purchaseDate: day("2022-11-10"),
    purchasePrice: 85,
    currency: "USD",
    createdAt: day("2025-08-19"),
    updatedAt: day("2025-08-19"),
  },
  {
    id: "dev-item-germany-2024-home",
    kitId: "germany-2024-2025-home",
    status: "sold",
    condition: "excellent",
    productVersion: "replica",
    edition: "fan",
    sleeve: "short",
    backType: "custom",
    customName: "MATÍAS",
    number: 7,
    purchaseDate: day("2024-06-01"),
    purchasePrice: 95,
    currency: "EUR",
    createdAt: day("2025-07-05"),
    updatedAt: day("2026-05-20"),
  },
];

export const devItemAddonSeeds: ItemAddonSeed[] = [
  { itemId: "dev-item-boca-2000-home", addonId: "patch-libertadores" },
  {
    itemId: "dev-item-boca-2000-home",
    addonId: "patch-intercontinental-champion",
  },
  {
    itemId: "dev-item-boca-2003-home",
    addonId: "patch-libertadores-champion",
  },
  { itemId: "dev-item-boca-2004-centenary", addonId: "marking-anniversary" },
  { itemId: "dev-item-arg-2022-home", addonId: "patch-world-cup" },
];

export const devWishlistSeeds: WishlistSeed[] = [
  {
    id: "dev-wish-arg-2021-home",
    kitId: "argentina-2021-2022-home",
    productVersion: "replica",
    edition: "fan",
    playerId: "messi",
    number: 10,
    notes: "Finalissima 2022 shirt.",
    createdAt: day("2026-01-10"),
  },
  {
    id: "dev-wish-boca-2007-home",
    kitId: "boca-juniors-2007-08-home",
    productVersion: "original",
    playerId: "riquelme",
    number: 10,
    notes: "Libertadores 2007 final.",
    createdAt: day("2026-02-21"),
  },
  {
    id: "dev-wish-france-2018-home",
    kitId: "france-2018-2019-home",
    notes: "2018 World Cup winners shirt.",
    createdAt: day("2026-03-05"),
  },
  {
    id: "dev-wish-spain-2024-home",
    kitId: "spain-2024-2025-home",
    createdAt: day("2026-04-18"),
  },
  {
    id: "dev-wish-boca-2001-away",
    kitId: "boca-juniors-2001-02-away",
    productVersion: "original",
    sleeve: "long",
    createdAt: day("2026-05-30"),
  },
];

/** Insert fake user data, but only into an empty collection + wishlist. */
export const applyDevSeed = async (
  db: ExpoSQLiteDatabase<Record<string, unknown>>,
) => {
  const typedDb = db as unknown as Db;

  const [anyItem, anyWish] = await Promise.all([
    typedDb
      .select({ id: schema.collectionItems.id })
      .from(schema.collectionItems)
      .limit(1),
    typedDb
      .select({ id: schema.wishlistItems.id })
      .from(schema.wishlistItems)
      .limit(1),
  ]);
  if (anyItem.length > 0 || anyWish.length > 0) return;

  await typedDb
    .insert(schema.collectionItems)
    .values(devItemSeeds)
    .onConflictDoNothing();
  await typedDb
    .insert(schema.itemAddons)
    .values(devItemAddonSeeds)
    .onConflictDoNothing();
  await typedDb
    .insert(schema.wishlistItems)
    .values(devWishlistSeeds)
    .onConflictDoNothing();
};

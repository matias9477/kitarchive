import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { players, wishlistItems } from "@/db/schema";
import { generateId } from "@/lib/id";
import { getKitSummariesByIds } from "@/features/catalogue/catalogueService";
import type { WishlistConfigInput, WishlistEntry, WishlistItem } from "./types";

/** All wishlist DB access lives here. One entry per kit (kit_id is UNIQUE). */

export const getEntries = async (): Promise<WishlistEntry[]> => {
  const db = getDb();
  const rows = await db
    .select({ entry: wishlistItems, playerName: players.name })
    .from(wishlistItems)
    .leftJoin(players, eq(wishlistItems.playerId, players.id))
    .orderBy(desc(wishlistItems.createdAt));
  if (rows.length === 0) return [];

  const kitSummaries = await getKitSummariesByIds(
    rows.map((r) => r.entry.kitId),
  );
  const byKitId = new Map(kitSummaries.map((k) => [k.kit.id, k]));

  return rows.flatMap((r) => {
    const kit = byKitId.get(r.entry.kitId);
    return kit ? [{ entry: r.entry, kit, playerName: r.playerName }] : [];
  });
};

export const add = async (
  kitId: string,
  config: WishlistConfigInput = {},
): Promise<WishlistItem> => {
  const row: WishlistItem = {
    id: generateId(),
    kitId,
    productVersion: config.productVersion ?? null,
    edition: config.edition ?? null,
    sleeve: config.sleeve ?? null,
    playerId: config.playerId ?? null,
    customName: config.customName ?? null,
    number: config.number ?? null,
    notes: config.notes ?? null,
    createdAt: new Date(),
  };
  await getDb().insert(wishlistItems).values(row);
  return row;
};

export const updateConfig = async (
  kitId: string,
  config: WishlistConfigInput,
): Promise<void> => {
  await getDb()
    .update(wishlistItems)
    .set({
      productVersion: config.productVersion ?? null,
      edition: config.edition ?? null,
      sleeve: config.sleeve ?? null,
      playerId: config.playerId ?? null,
      customName: config.customName ?? null,
      number: config.number ?? null,
      notes: config.notes ?? null,
    })
    .where(eq(wishlistItems.kitId, kitId));
};

export const removeByKit = async (kitId: string): Promise<void> => {
  await getDb().delete(wishlistItems).where(eq(wishlistItems.kitId, kitId));
};

export const isWishlisted = async (kitId: string): Promise<boolean> => {
  const rows = await getDb()
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(eq(wishlistItems.kitId, kitId))
    .limit(1);
  return rows.length > 0;
};

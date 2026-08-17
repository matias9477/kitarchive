import { and, eq, like, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { collectionItems, eras, kits, players, teams } from "@/db/schema";
import {
  getKitSummariesByIds,
  searchKitSummaries,
} from "@/features/catalogue/catalogueService";
import type { KitSummary } from "@/features/catalogue/types";
import type { GlobalSearchResults } from "./types";

/**
 * Searches team/season/kit/manufacturer via the catalogue, plus player names
 * and shirt numbers via collection items, then groups by ownership state.
 * Like the catalogue search, this is tokenized: every term must match at
 * least one field, so "boca riquelme" and "riquelme 10" both resolve.
 */
export const searchGlobal = async (
  query: string,
): Promise<GlobalSearchResults> => {
  const trimmed = query.trim();
  if (!trimmed)
    return { query: trimmed, collection: [], wishlist: [], catalogue: [] };

  const kitMatches = await searchKitSummaries(trimmed);

  // Item-level matches (player, custom name, number — with team/era context
  // joined in so mixed queries work) surface their kits too.
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const tokenMatches = (token: string) => {
    const q = `%${token}%`;
    return or(
      like(players.name, q),
      like(players.fullName, q),
      like(collectionItems.customName, q),
      like(teams.name, q),
      like(teams.shortName, q),
      like(eras.label, q),
      sql`CAST(${eras.startYear} AS TEXT) LIKE ${q}`,
      sql`CAST(${eras.endYear} AS TEXT) LIKE ${q}`,
      ...(/^\d{1,2}$/.test(token)
        ? [eq(collectionItems.number, Number(token))]
        : []),
    );
  };
  const itemMatches = await getDb()
    .select({ kitId: collectionItems.kitId })
    .from(collectionItems)
    .innerJoin(kits, eq(collectionItems.kitId, kits.id))
    .innerJoin(teams, eq(kits.teamId, teams.id))
    .innerJoin(eras, eq(kits.eraId, eras.id))
    .leftJoin(players, eq(collectionItems.playerId, players.id))
    .where(and(...tokens.map(tokenMatches)));

  const seen = new Set(kitMatches.map((k) => k.kit.id));
  const extraKitIds = [...new Set(itemMatches.map((i) => i.kitId))].filter(
    (id) => !seen.has(id),
  );
  const extraKits = await getKitSummariesByIds(extraKitIds);

  const all = [...kitMatches, ...extraKits];
  const collection: KitSummary[] = [];
  const wishlist: KitSummary[] = [];
  const catalogue: KitSummary[] = [];
  for (const summary of all) {
    if (summary.ownedCount > 0) collection.push(summary);
    else if (summary.wishlisted) wishlist.push(summary);
    else catalogue.push(summary);
  }

  return { query: trimmed, collection, wishlist, catalogue };
};

import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { collectionItems, eras, kits, teams, wishlistItems } from "@/db/schema";
import type { Condition, KitType } from "@/config/types";
import {
  getEras,
  getKitSummariesByIds,
  getKitSummariesByTeam,
} from "@/features/catalogue/catalogueService";
import { getItems } from "@/features/collection/collectionService";
import type {
  CountBucket,
  DashboardStats,
  EraProgress,
  TeamProgress,
} from "./types";

/**
 * Derived statistics. Aggregation happens in JS over one joined query — a
 * personal collection is small enough that this beats fighting SQL group-bys.
 */

interface OwnedItemFact {
  kitId: string;
  teamId: string;
  teamName: string;
  kitType: KitType;
  condition: Condition;
  startYear: number;
}

const getOwnedFacts = async (): Promise<OwnedItemFact[]> =>
  getDb()
    .select({
      kitId: collectionItems.kitId,
      teamId: teams.id,
      teamName: teams.name,
      kitType: kits.type,
      condition: collectionItems.condition,
      startYear: eras.startYear,
    })
    .from(collectionItems)
    .innerJoin(kits, eq(collectionItems.kitId, kits.id))
    .innerJoin(teams, eq(kits.teamId, teams.id))
    .innerJoin(eras, eq(kits.eraId, eras.id))
    .where(eq(collectionItems.status, "owned"));

const bucketize = <T extends string>(
  keys: T[],
  labelOf: (key: T) => string = (k) => k,
): CountBucket<T>[] => {
  const counts = new Map<T, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labelOf(key), count }))
    .sort((a, b) => b.count - a.count);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const db = getDb();
  const facts = await getOwnedFacts();

  const wishlistRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(wishlistItems);
  const soldRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(collectionItems)
    .where(eq(collectionItems.status, "sold"));

  const teamLabels = new Map(facts.map((f) => [f.teamId, f.teamName]));

  const copiesByKit = new Map<string, number>();
  for (const f of facts)
    copiesByKit.set(f.kitId, (copiesByKit.get(f.kitId) ?? 0) + 1);
  const duplicateKitIds = [...copiesByKit.entries()].filter(([, n]) => n > 1);
  const duplicateSummaries = await getKitSummariesByIds(
    duplicateKitIds.map(([id]) => id),
  );
  const summaryByKit = new Map(duplicateSummaries.map((s) => [s.kit.id, s]));

  const recentItems = (await getItems()).slice(0, 6);

  return {
    totalOwned: facts.length,
    wishlistCount: wishlistRows[0]?.count ?? 0,
    soldCount: soldRows[0]?.count ?? 0,
    teamCount: teamLabels.size,
    byTeam: bucketize(
      facts.map((f) => f.teamId),
      (id) => teamLabels.get(id) ?? id,
    ),
    byType: bucketize(facts.map((f) => f.kitType)),
    byDecade: bucketize(
      facts.map((f) => `${Math.floor(f.startYear / 10) * 10}s`),
    ).sort((a, b) => a.key.localeCompare(b.key)),
    byCondition: bucketize(facts.map((f) => f.condition)),
    duplicates: duplicateKitIds.flatMap(([kitId, count]) => {
      const kit = summaryByKit.get(kitId);
      return kit ? [{ kit, count }] : [];
    }),
    recentItems,
  };
};

/** Completion per era for a team; missing kits are the ownedCount === 0 rows. */
export const getTeamProgress = async (
  teamId: string,
): Promise<TeamProgress | null> => {
  const [teamEras, kitSummaries] = await Promise.all([
    getEras(teamId),
    getKitSummariesByTeam(teamId),
  ]);
  const teamName = kitSummaries[0]?.teamName;

  const byEra = new Map<string, EraProgress>();
  for (const era of teamEras)
    byEra.set(era.id, { era, kits: [], ownedKits: 0, totalKits: 0 });
  for (const summary of kitSummaries) {
    const progress = byEra.get(summary.kit.eraId);
    if (!progress) continue;
    progress.kits.push(summary);
    progress.totalKits += 1;
    if (summary.ownedCount > 0) progress.ownedKits += 1;
  }

  const eraProgress = [...byEra.values()];
  return {
    teamId,
    teamName: teamName ?? "",
    eras: eraProgress,
    ownedKits: eraProgress.reduce((n, e) => n + e.ownedKits, 0),
    totalKits: eraProgress.reduce((n, e) => n + e.totalKits, 0),
    ownedItems: kitSummaries.reduce((n, s) => n + s.ownedCount, 0),
  };
};

/** Owned/total kit counts per team that has catalogue kits — used by the widget. */
export const getAllTeamKitCounts = async (): Promise<
  {
    teamId: string;
    teamName: string;
    ownedKits: number;
    totalKits: number;
    ownedItems: number;
  }[]
> => {
  const db = getDb();
  const totals = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      totalKits: sql<number>`count(${kits.id})`,
    })
    .from(teams)
    .innerJoin(kits, eq(kits.teamId, teams.id))
    .groupBy(teams.id);

  const owned = await db
    .select({ teamId: kits.teamId, kitId: kits.id })
    .from(collectionItems)
    .innerJoin(kits, eq(collectionItems.kitId, kits.id))
    .where(eq(collectionItems.status, "owned"));
  const ownedKitsByTeam = new Map<string, Set<string>>();
  const ownedItemsByTeam = new Map<string, number>();
  for (const row of owned) {
    const set = ownedKitsByTeam.get(row.teamId) ?? new Set<string>();
    set.add(row.kitId);
    ownedKitsByTeam.set(row.teamId, set);
    ownedItemsByTeam.set(
      row.teamId,
      (ownedItemsByTeam.get(row.teamId) ?? 0) + 1,
    );
  }

  return totals
    .map((t) => ({
      teamId: t.teamId,
      teamName: t.teamName,
      ownedKits: ownedKitsByTeam.get(t.teamId)?.size ?? 0,
      totalKits: t.totalKits,
      ownedItems: ownedItemsByTeam.get(t.teamId) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.ownedKits - a.ownedKits || a.teamName.localeCompare(b.teamName),
    );
};

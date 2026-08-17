import type { Condition, KitType } from "@/config/types";
import type { Era, KitSummary } from "@/features/catalogue/types";
import type { CollectionItemSummary } from "@/features/collection/types";

export interface CountBucket<T extends string = string> {
  key: T;
  label: string;
  count: number;
}

/** High-level stats over the user's physical collection (spec §29). */
export interface DashboardStats {
  totalOwned: number;
  wishlistCount: number;
  soldCount: number;
  teamCount: number;
  byTeam: CountBucket[];
  byType: CountBucket<KitType>[];
  byDecade: CountBucket[];
  byCondition: CountBucket<Condition>[];
  /** Kits with more than one owned physical copy. */
  duplicates: { kit: KitSummary; count: number }[];
  recentItems: CollectionItemSummary[];
}

export interface EraProgress {
  era: Era;
  kits: KitSummary[];
  ownedKits: number;
  totalKits: number;
}

/** Catalogue completion for one team — missing = catalogue − owned (spec §27). */
export interface TeamProgress {
  teamId: string;
  teamName: string;
  eras: EraProgress[];
  ownedKits: number;
  totalKits: number;
  /** Total physical shirts across those kits. */
  ownedItems: number;
}

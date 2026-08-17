import type { KitSummary } from "@/features/catalogue/types";

/**
 * Global search results, grouped for the fastest answer to
 * "do I already have this?" (spec §31).
 */
export interface GlobalSearchResults {
  query: string;
  collection: KitSummary[];
  wishlist: KitSummary[];
  catalogue: KitSummary[];
}

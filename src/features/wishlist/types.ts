import type { wishlistItems } from "@/db/schema";
import type { Edition, ProductVersion, SleeveType } from "@/config/types";
import type { KitSummary } from "@/features/catalogue/types";

export type WishlistItem = typeof wishlistItems.$inferSelect;

/** A wishlist row joined with its catalogue kit for display. */
export interface WishlistEntry {
  entry: WishlistItem;
  kit: KitSummary;
  playerName: string | null;
}

/** Optional desired configuration (spec §24) — the kit itself is the wish. */
export interface WishlistConfigInput {
  productVersion?: ProductVersion;
  edition?: Edition;
  sleeve?: SleeveType;
  playerId?: string;
  customName?: string;
  number?: number;
  notes?: string;
}

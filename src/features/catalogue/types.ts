import type {
  addons,
  competitions,
  countries,
  eras,
  kitImages,
  kits,
  manufacturers,
  players,
  teams,
} from "@/db/schema";
import type { KitType, OwnershipState, TeamType } from "@/config/types";

export type Country = typeof countries.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Era = typeof eras.$inferSelect;
export type Manufacturer = typeof manufacturers.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Kit = typeof kits.$inferSelect;
export type KitImage = typeof kitImages.$inferSelect;
export type Addon = typeof addons.$inferSelect;
export type Player = typeof players.$inferSelect;

/** A kit joined with everything a card needs to render. */
export interface KitSummary {
  kit: Kit;
  teamName: string;
  teamPrimaryColor: string;
  teamSecondaryColor: string | null;
  eraLabel: string;
  manufacturerName: string | null;
  /** First reference image, if the user attached any. */
  imageUri: string | null;
  ownedCount: number;
  wishlisted: boolean;
}

export const ownershipOf = (
  summary: Pick<KitSummary, "ownedCount" | "wishlisted">,
): OwnershipState =>
  summary.ownedCount > 0
    ? "owned"
    : summary.wishlisted
      ? "wishlist"
      : "missing";

export interface KitDetail extends KitSummary {
  images: KitImage[];
  competitions: Competition[];
}

export interface TeamWithCountry extends Team {
  countryName: string;
  flagEmoji: string | null;
}

export interface CreateTeamInput {
  name: string;
  shortName?: string;
  countryId: string;
  type: TeamType;
  primaryColor: string;
  secondaryColor?: string;
}

export interface CreateEraInput {
  teamId: string;
  startYear: number;
  endYear?: number;
  label: string;
}

export interface CreateKitInput {
  teamId: string;
  eraId: string;
  type: KitType;
  manufacturerId?: string;
  description?: string;
  competitionIds?: string[];
}

export interface UpdateKitInput {
  type?: KitType;
  manufacturerId?: string | null;
  description?: string | null;
  competitionIds?: string[];
}

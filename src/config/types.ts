/** Language codes the app ships translations for. */
export type LanguageCode = "en" | "es";

/**
 * Shared domain unions. Stored as TEXT in SQLite; adding a value is a code
 * change (update here + i18n `enums.*` labels), which is fine for a local app.
 */

/** Where a catalogue row came from. Seed rows are upserted by stable IDs on
 * seed-version bumps; user rows are never touched by the seeder. */
export type EntitySource = "seed" | "user";

export type TeamType = "club" | "national";

/** Base role/design of a catalogue kit (spec §9). */
export type KitType =
  | "home"
  | "away"
  | "third"
  | "goalkeeper"
  | "special"
  | "commemorative"
  | "championship";

/** Standardized condition scale, best → worst (spec §19). */
export type Condition =
  "deadstock" | "excellent" | "very_good" | "good" | "fair" | "poor";

/**
 * Genuine-product dimension (spec §14). Deliberately separate from `Edition`:
 * original-vs-replica is about licensing/provenance, fan-vs-player is about cut.
 */
export type ProductVersion =
  "original" | "replica" | "match_issued" | "match_worn";

/** Fan vs player cut of the shirt. */
export type Edition = "fan" | "player";

export type SleeveType = "short" | "long";

/** Back customization state of a physical shirt (spec §16). */
export type BackType = "blank" | "player" | "custom" | "number_only";

export type ItemStatus = "owned" | "sold";

export type AddonType =
  | "competition_patch"
  | "champion_patch"
  | "final_patch"
  | "anniversary"
  | "marking"
  | "other";

/** Derived catalogue-kit state relative to the user (never stored). */
export type OwnershipState = "owned" | "wishlist" | "missing";

export type PhotoKind = "front" | "back" | "tag" | "detail" | "other";

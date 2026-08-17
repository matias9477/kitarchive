import type {
  AddonType,
  BackType,
  Condition,
  Edition,
  KitType,
  LanguageCode,
  PhotoKind,
  ProductVersion,
  SleeveType,
} from "./types";

export const DEFAULT_LANGUAGE: LanguageCode = "en";

/**
 * Ordered value lists for pickers/filters. Labels come from i18n under
 * `enums.<group>.<value>` — keep locales in sync when editing these.
 */
export const KIT_TYPES: KitType[] = [
  "home",
  "away",
  "third",
  "goalkeeper",
  "special",
  "commemorative",
  "championship",
];

export const CONDITIONS: Condition[] = [
  "deadstock",
  "excellent",
  "very_good",
  "good",
  "fair",
  "poor",
];

export const PRODUCT_VERSIONS: ProductVersion[] = [
  "original",
  "replica",
  "match_issued",
  "match_worn",
];

export const EDITIONS: Edition[] = ["fan", "player"];

export const SLEEVE_TYPES: SleeveType[] = ["short", "long"];

export const BACK_TYPES: BackType[] = [
  "blank",
  "player",
  "custom",
  "number_only",
];

export const ADDON_TYPES: AddonType[] = [
  "competition_patch",
  "champion_patch",
  "final_patch",
  "anniversary",
  "marking",
  "other",
];

export const PHOTO_KINDS: PhotoKind[] = [
  "front",
  "back",
  "tag",
  "detail",
  "other",
];

/** Common purchase currencies, first is the picker default. */
export const CURRENCIES = ["EUR", "USD", "ARS", "GBP"] as const;

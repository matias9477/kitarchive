import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type {
  AddonType,
  BackType,
  Condition,
  Edition,
  EntitySource,
  ItemStatus,
  KitType,
  LanguageCode,
  PhotoKind,
  ProductVersion,
  SleeveType,
  TeamType,
} from "@/config/types";

/**
 * Domain model: "Catalogue what exists. Track what you own."
 * Catalogue tables (countries → teams → eras → kits, plus lookups) are seeded
 * and user-extendable; collection/wishlist tables are user data only.
 *
 * Keep every table in sync with the raw CREATE TABLE statements in
 * db/client.ts — there is no automated migration runner.
 */

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);
const source = () =>
  text("source").$type<EntitySource>().notNull().default("user");

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export const countries = sqliteTable("countries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  flagEmoji: text("flag_emoji"),
  source: source(),
});

export const teams = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    shortName: text("short_name"),
    countryId: text("country_id")
      .notNull()
      .references(() => countries.id),
    type: text("type").$type<TeamType>().notNull(),
    /** Hex colors used for generated placeholder kit art. */
    primaryColor: text("primary_color").notNull().default("#1d2022"),
    secondaryColor: text("secondary_color"),
    source: source(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("idx_teams_country").on(t.countryId)],
);

/**
 * A club season ("2006/07") or a national-team kit cycle ("2004–06") — same
 * shape, distinguished by the owning team's type. Label is free-form so
 * Apertura/Clausura-style naming fits too.
 */
export const eras = sqliteTable(
  "eras",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    startYear: integer("start_year").notNull(),
    endYear: integer("end_year"),
    label: text("label").notNull(),
    source: source(),
  },
  (t) => [index("idx_eras_team").on(t.teamId)],
);

export const manufacturers = sqliteTable("manufacturers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  source: source(),
});

export const competitions = sqliteTable("competitions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  source: source(),
});

/** The catalogue kit — a shirt design, never a physical shirt (spec §2.2). */
export const kits = sqliteTable(
  "kits",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    eraId: text("era_id")
      .notNull()
      .references(() => eras.id),
    type: text("type").$type<KitType>().notNull(),
    manufacturerId: text("manufacturer_id").references(() => manufacturers.id),
    description: text("description"),
    source: source(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("idx_kits_team").on(t.teamId),
    index("idx_kits_era").on(t.eraId),
  ],
);

/** Contextual competition metadata on a kit — never creates a new kit (§7.3). */
export const kitCompetitions = sqliteTable(
  "kit_competitions",
  {
    kitId: text("kit_id")
      .notNull()
      .references(() => kits.id, { onDelete: "cascade" }),
    competitionId: text("competition_id")
      .notNull()
      .references(() => competitions.id),
  },
  (t) => [primaryKey({ columns: [t.kitId, t.competitionId] })],
);

/** Reference images of the catalogue design (user-attached local files). */
export const kitImages = sqliteTable(
  "kit_images",
  {
    id: text("id").primaryKey(),
    kitId: text("kit_id")
      .notNull()
      .references(() => kits.id, { onDelete: "cascade" }),
    uri: text("uri").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("idx_kit_images_kit").on(t.kitId)],
);

/** Patches/markings applied to physical shirts — shared catalogue (§12). */
export const addons = sqliteTable("addons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").$type<AddonType>().notNull().default("other"),
  competitionId: text("competition_id").references(() => competitions.id),
  description: text("description"),
  source: source(),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name"),
  source: source(),
});

// ---------------------------------------------------------------------------
// Collection (user data)
// ---------------------------------------------------------------------------

/** One physical shirt. Always belongs to exactly one catalogue kit. */
export const collectionItems = sqliteTable(
  "collection_items",
  {
    id: text("id").primaryKey(),
    kitId: text("kit_id")
      .notNull()
      .references(() => kits.id),
    status: text("status").$type<ItemStatus>().notNull().default("owned"),
    condition: text("condition").$type<Condition>().notNull(),
    conditionNote: text("condition_note"),
    productVersion: text("product_version").$type<ProductVersion>(),
    edition: text("edition").$type<Edition>(),
    sleeve: text("sleeve").$type<SleeveType>(),
    backType: text("back_type").$type<BackType>().notNull().default("blank"),
    playerId: text("player_id").references(() => players.id),
    customName: text("custom_name"),
    number: integer("number"),
    purchaseDate: integer("purchase_date", { mode: "timestamp" }),
    seller: text("seller"),
    /** Nominal historical amount — never converted or compared (§21). */
    purchasePrice: real("purchase_price"),
    currency: text("currency"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("idx_items_kit").on(t.kitId),
    index("idx_items_status").on(t.status),
  ],
);

export const itemAddons = sqliteTable(
  "item_addons",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => collectionItems.id, { onDelete: "cascade" }),
    addonId: text("addon_id")
      .notNull()
      .references(() => addons.id),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.addonId] })],
);

/** Photos of the user's actual shirt — distinct from kit reference images. */
export const itemPhotos = sqliteTable(
  "item_photos",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => collectionItems.id, { onDelete: "cascade" }),
    uri: text("uri").notNull(),
    kind: text("kind").$type<PhotoKind>(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("idx_item_photos_item").on(t.itemId)],
);

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

/** A desired catalogue kit, optionally with a desired configuration (§24). */
export const wishlistItems = sqliteTable(
  "wishlist_items",
  {
    id: text("id").primaryKey(),
    kitId: text("kit_id")
      .notNull()
      .unique()
      .references(() => kits.id),
    productVersion: text("product_version").$type<ProductVersion>(),
    edition: text("edition").$type<Edition>(),
    sleeve: text("sleeve").$type<SleeveType>(),
    playerId: text("player_id").references(() => players.id),
    customName: text("custom_name"),
    number: integer("number"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (t) => [index("idx_wishlist_kit").on(t.kitId)],
);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** App-wide settings (single row, id = 'default'). */
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("default"),
  language: text("language").$type<LanguageCode>().notNull().default("en"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
    .notNull()
    .default(false),
  /** Last applied catalogue seed version — see db/seed. */
  seedVersion: integer("seed_version").notNull().default(0),
  updatedAt: updatedAt(),
});

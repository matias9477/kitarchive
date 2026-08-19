import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";
import { applySeed } from "./seed";
import { applyDevSeed } from "./seed/dev";
import { normalizeImageUris } from "./imagePaths";

const DB_NAME = "kitarchive.db";

let sqliteDb: SQLite.SQLiteDatabase | null = null;
let drizzleDb: ReturnType<typeof drizzle> | null = null;

const getDatabase = () => {
  if (!sqliteDb) sqliteDb = SQLite.openDatabaseSync(DB_NAME);
  if (!drizzleDb) drizzleDb = drizzle(sqliteDb, { schema });
  return drizzleDb;
};

export const getDb = () => getDatabase();

/**
 * Create tables if they don't exist. Keep in sync with db/schema.ts — there is
 * no automated migration runner. Additive column changes go in try/catch ALTER
 * blocks at the bottom (SQLite has no "ADD COLUMN IF NOT EXISTS").
 */
/**
 * Schema epoch, stored in PRAGMA user_version. Version 1 replaced the
 * pre-domain template tables (`kits` was id/title/description, `settings` had
 * theme columns) with the catalogue/collection schema. The template shape
 * never shipped, so an epoch-0 database is dev data — rebuild it.
 */
export const SCHEMA_VERSION = 1;

const runMigrations = async () => {
  if (!sqliteDb) sqliteDb = SQLite.openDatabaseSync(DB_NAME);

  sqliteDb.execSync("PRAGMA foreign_keys = ON");

  const row = sqliteDb.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
    sqliteDb.execSync(`
      DROP TABLE IF EXISTS kits;
      DROP TABLE IF EXISTS settings;
    `);
    sqliteDb.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }

  sqliteDb.execSync(`
    CREATE TABLE IF NOT EXISTS countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      flag_emoji TEXT,
      source TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      country_id TEXT NOT NULL REFERENCES countries(id),
      type TEXT NOT NULL,
      primary_color TEXT NOT NULL DEFAULT '#1d2022',
      secondary_color TEXT,
      source TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country_id);

    CREATE TABLE IF NOT EXISTS eras (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id),
      start_year INTEGER NOT NULL,
      end_year INTEGER,
      label TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'user'
    );
    CREATE INDEX IF NOT EXISTS idx_eras_team ON eras(team_id);

    CREATE TABLE IF NOT EXISTS manufacturers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS kits (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id),
      era_id TEXT NOT NULL REFERENCES eras(id),
      type TEXT NOT NULL,
      manufacturer_id TEXT REFERENCES manufacturers(id),
      description TEXT,
      source TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_kits_team ON kits(team_id);
    CREATE INDEX IF NOT EXISTS idx_kits_era ON kits(era_id);

    CREATE TABLE IF NOT EXISTS kit_competitions (
      kit_id TEXT NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
      competition_id TEXT NOT NULL REFERENCES competitions(id),
      PRIMARY KEY (kit_id, competition_id)
    );

    CREATE TABLE IF NOT EXISTS kit_images (
      id TEXT PRIMARY KEY,
      kit_id TEXT NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_kit_images_kit ON kit_images(kit_id);

    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      competition_id TEXT REFERENCES competitions(id),
      description TEXT,
      source TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      full_name TEXT,
      source TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      id TEXT PRIMARY KEY,
      kit_id TEXT NOT NULL REFERENCES kits(id),
      status TEXT NOT NULL DEFAULT 'owned',
      condition TEXT NOT NULL,
      condition_note TEXT,
      product_version TEXT,
      edition TEXT,
      sleeve TEXT,
      back_type TEXT NOT NULL DEFAULT 'blank',
      player_id TEXT REFERENCES players(id),
      custom_name TEXT,
      number INTEGER,
      purchase_date INTEGER,
      seller TEXT,
      purchase_price REAL,
      currency TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_items_kit ON collection_items(kit_id);
    CREATE INDEX IF NOT EXISTS idx_items_status ON collection_items(status);

    CREATE TABLE IF NOT EXISTS item_addons (
      item_id TEXT NOT NULL REFERENCES collection_items(id) ON DELETE CASCADE,
      addon_id TEXT NOT NULL REFERENCES addons(id),
      PRIMARY KEY (item_id, addon_id)
    );

    CREATE TABLE IF NOT EXISTS item_photos (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL REFERENCES collection_items(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      kind TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_item_photos_item ON item_photos(item_id);

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      kit_id TEXT NOT NULL UNIQUE REFERENCES kits(id),
      product_version TEXT,
      edition TEXT,
      sleeve TEXT,
      player_id TEXT REFERENCES players(id),
      custom_name TEXT,
      number INTEGER,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_wishlist_kit ON wishlist_items(kit_id);

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      language TEXT NOT NULL DEFAULT 'en',
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      seed_version INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  if (!drizzleDb && sqliteDb) drizzleDb = drizzle(sqliteDb, { schema });
};

/** Run once at app startup, from App.tsx. */
export const initializeDatabase = async () => {
  await runMigrations();

  const db = getDb();
  if (!db) throw new Error("Failed to initialize database connection");

  const existing = await db.select().from(schema.settings).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.settings).values({ id: "default" });
  }

  await normalizeImageUris(db);

  await applySeed(db);

  if (__DEV__) await applyDevSeed(db);

  return db;
};

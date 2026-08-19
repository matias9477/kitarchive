import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import {
  addonSeeds,
  competitionSeeds,
  countrySeeds,
  manufacturerSeeds,
  playerSeeds,
  teamSeeds,
} from "./core";
import { bocaEraSeeds, bocaKitCompetitionSeeds, bocaKitSeeds } from "./boca";
import {
  argentinaEraSeeds,
  argentinaKitCompetitionSeeds,
  argentinaKitSeeds,
} from "./argentina";
import { nationEraSeeds, nationKitSeeds } from "./nations";
import { LATEST_SEASON_START } from "./season";
import type { SeedBundle } from "./types";

/**
 * Bump when the seed data grows. The seeder is insert-only (ON CONFLICT DO
 * NOTHING on stable IDs): new versions add rows, but rows already in the DB —
 * including seed rows the user has corrected in-app — are never overwritten.
 */
export const SEED_VERSION = 2;

/**
 * The stored version also encodes the season horizon (season.ts), so the
 * seeder re-runs — and adds the freshly generated eras/kits — when the
 * calendar year rolls over, without a manual SEED_VERSION bump. Monotonic as
 * long as SEED_VERSION only ever increments.
 */
const EFFECTIVE_SEED_VERSION = SEED_VERSION * 10_000 + LATEST_SEASON_START;

const bundle: SeedBundle = {
  countries: countrySeeds,
  manufacturers: manufacturerSeeds,
  competitions: competitionSeeds,
  addons: addonSeeds,
  players: playerSeeds,
  teams: teamSeeds,
  eras: [...bocaEraSeeds, ...argentinaEraSeeds, ...nationEraSeeds],
  kits: [...bocaKitSeeds, ...argentinaKitSeeds, ...nationKitSeeds],
  kitCompetitions: [
    ...bocaKitCompetitionSeeds,
    ...argentinaKitCompetitionSeeds,
  ],
};

type Db = ExpoSQLiteDatabase<typeof schema>;

const CHUNK = 50;

const insertIgnoring = async <T>(
  db: Db,
  table: Parameters<Db["insert"]>[0],
  rows: T[],
): Promise<void> => {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db
      .insert(table)
      .values(rows.slice(i, i + CHUNK) as never)
      .onConflictDoNothing();
  }
};

/** Apply the catalogue seed if the stored version is behind. */
export const applySeed = async (
  db: ExpoSQLiteDatabase<Record<string, unknown>>,
) => {
  const typedDb = db as unknown as Db;

  const row = await typedDb
    .select({ seedVersion: schema.settings.seedVersion })
    .from(schema.settings)
    .where(eq(schema.settings.id, "default"))
    .limit(1);
  const currentVersion = row[0]?.seedVersion ?? 0;
  if (currentVersion >= EFFECTIVE_SEED_VERSION) return;

  // Insert in FK dependency order.
  await insertIgnoring(typedDb, schema.countries, bundle.countries);
  await insertIgnoring(typedDb, schema.manufacturers, bundle.manufacturers);
  await insertIgnoring(typedDb, schema.competitions, bundle.competitions);
  await insertIgnoring(typedDb, schema.addons, bundle.addons);
  await insertIgnoring(typedDb, schema.players, bundle.players);
  await insertIgnoring(typedDb, schema.teams, bundle.teams);
  await insertIgnoring(typedDb, schema.eras, bundle.eras);
  await insertIgnoring(typedDb, schema.kits, bundle.kits);
  await insertIgnoring(typedDb, schema.kitCompetitions, bundle.kitCompetitions);

  await typedDb
    .update(schema.settings)
    .set({ seedVersion: EFFECTIVE_SEED_VERSION, updatedAt: new Date() })
    .where(eq(schema.settings.id, "default"));
};

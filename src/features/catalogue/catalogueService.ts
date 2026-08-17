import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  addons,
  collectionItems,
  competitions,
  countries,
  eras,
  kitCompetitions,
  kitImages,
  kits,
  manufacturers,
  players,
  teams,
  wishlistItems,
} from "@/db/schema";
import { generateId } from "@/lib/id";
import type {
  Addon,
  Competition,
  Country,
  CreateEraInput,
  CreateKitInput,
  CreateTeamInput,
  Era,
  Kit,
  KitDetail,
  KitImage,
  KitSummary,
  Manufacturer,
  Player,
  TeamWithCountry,
  UpdateKitInput,
} from "./types";

/**
 * All catalogue DB access lives here. Rows created through this service are
 * always source='user'; seed rows come from db/seed.
 */

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export const getCountries = async (): Promise<Country[]> =>
  getDb().select().from(countries).orderBy(asc(countries.name));

export const getTeams = async (): Promise<TeamWithCountry[]> => {
  const rows = await getDb()
    .select({
      team: teams,
      countryName: countries.name,
      flagEmoji: countries.flagEmoji,
    })
    .from(teams)
    .innerJoin(countries, eq(teams.countryId, countries.id))
    .orderBy(asc(teams.name));
  return rows.map((r) => ({
    ...r.team,
    countryName: r.countryName,
    flagEmoji: r.flagEmoji,
  }));
};

export const getTeamById = async (
  id: string,
): Promise<TeamWithCountry | null> => {
  const rows = await getDb()
    .select({
      team: teams,
      countryName: countries.name,
      flagEmoji: countries.flagEmoji,
    })
    .from(teams)
    .innerJoin(countries, eq(teams.countryId, countries.id))
    .where(eq(teams.id, id))
    .limit(1);
  const row = rows[0];
  return row
    ? { ...row.team, countryName: row.countryName, flagEmoji: row.flagEmoji }
    : null;
};

export const getEras = async (teamId: string): Promise<Era[]> =>
  getDb()
    .select()
    .from(eras)
    .where(eq(eras.teamId, teamId))
    .orderBy(desc(eras.startYear), desc(eras.label));

export const getManufacturers = async (): Promise<Manufacturer[]> =>
  getDb().select().from(manufacturers).orderBy(asc(manufacturers.name));

export const getCompetitions = async (): Promise<Competition[]> =>
  getDb().select().from(competitions).orderBy(asc(competitions.name));

export const getAddons = async (): Promise<Addon[]> =>
  getDb().select().from(addons).orderBy(asc(addons.name));

export const getPlayers = async (): Promise<Player[]> =>
  getDb().select().from(players).orderBy(asc(players.name));

// ---------------------------------------------------------------------------
// Kit summaries (kits + card context + ownership)
// ---------------------------------------------------------------------------

type JoinedKitRow = {
  kit: Kit;
  teamName: string;
  teamPrimaryColor: string;
  teamSecondaryColor: string | null;
  eraLabel: string;
  manufacturerName: string | null;
};

const selectJoinedKits = () =>
  getDb()
    .select({
      kit: kits,
      teamName: teams.name,
      teamPrimaryColor: teams.primaryColor,
      teamSecondaryColor: teams.secondaryColor,
      eraLabel: eras.label,
      manufacturerName: manufacturers.name,
    })
    .from(kits)
    .innerJoin(teams, eq(kits.teamId, teams.id))
    .innerJoin(eras, eq(kits.eraId, eras.id))
    .leftJoin(manufacturers, eq(kits.manufacturerId, manufacturers.id));

/** Attach owned counts, wishlist flags and first reference image in bulk. */
const toSummaries = async (rows: JoinedKitRow[]): Promise<KitSummary[]> => {
  if (rows.length === 0) return [];
  const db = getDb();
  const kitIds = rows.map((r) => r.kit.id);

  const counts = await db
    .select({ kitId: collectionItems.kitId, count: sql<number>`count(*)` })
    .from(collectionItems)
    .where(
      and(
        inArray(collectionItems.kitId, kitIds),
        eq(collectionItems.status, "owned"),
      ),
    )
    .groupBy(collectionItems.kitId);
  const countByKit = new Map(counts.map((c) => [c.kitId, c.count]));

  const wishes = await db
    .select({ kitId: wishlistItems.kitId })
    .from(wishlistItems)
    .where(inArray(wishlistItems.kitId, kitIds));
  const wishedKits = new Set(wishes.map((w) => w.kitId));

  const images = await db
    .select()
    .from(kitImages)
    .where(inArray(kitImages.kitId, kitIds))
    .orderBy(asc(kitImages.sortOrder), asc(kitImages.createdAt));
  const firstImageByKit = new Map<string, string>();
  for (const image of images) {
    if (!firstImageByKit.has(image.kitId))
      firstImageByKit.set(image.kitId, image.uri);
  }

  return rows.map((r) => ({
    ...r,
    imageUri: firstImageByKit.get(r.kit.id) ?? null,
    ownedCount: countByKit.get(r.kit.id) ?? 0,
    wishlisted: wishedKits.has(r.kit.id),
  }));
};

export const getKitSummariesByEra = async (
  eraId: string,
): Promise<KitSummary[]> =>
  toSummaries(await selectJoinedKits().where(eq(kits.eraId, eraId)));

export const getKitSummariesByTeam = async (
  teamId: string,
): Promise<KitSummary[]> =>
  toSummaries(
    await selectJoinedKits()
      .where(eq(kits.teamId, teamId))
      .orderBy(desc(eras.startYear)),
  );

export const getKitSummariesByIds = async (
  kitIds: string[],
): Promise<KitSummary[]> =>
  kitIds.length === 0
    ? []
    : toSummaries(await selectJoinedKits().where(inArray(kits.id, kitIds)));

/**
 * "Add next" suggestions: the teams of the most recently added shirts, in
 * recency order — you usually keep adding to the collection you were just
 * working on.
 */
export const getSuggestedTeams = async (
  limit = 3,
): Promise<TeamWithCountry[]> => {
  const recents = await getDb()
    .select({ teamId: kits.teamId })
    .from(collectionItems)
    .innerJoin(kits, eq(collectionItems.kitId, kits.id))
    .orderBy(desc(collectionItems.createdAt))
    .limit(20);

  const teamIds: string[] = [];
  for (const { teamId } of recents)
    if (!teamIds.includes(teamId)) teamIds.push(teamId);
  const top = teamIds.slice(0, limit);
  if (top.length === 0) return [];

  const rows = await getDb()
    .select({
      team: teams,
      countryName: countries.name,
      flagEmoji: countries.flagEmoji,
    })
    .from(teams)
    .innerJoin(countries, eq(teams.countryId, countries.id))
    .where(inArray(teams.id, top));
  const byId = new Map(
    rows.map((r) => [
      r.team.id,
      { ...r.team, countryName: r.countryName, flagEmoji: r.flagEmoji },
    ]),
  );
  return top.flatMap((id) => byId.get(id) ?? []);
};

/**
 * Tokenized inclusion search: every whitespace-separated term must match at
 * least one field (substring, case-insensitive), so "boca 2022" finds every
 * Boca kit whose era touches 2022. Era years are matched numerically too,
 * because "2022" is not a substring of the label "2021/22".
 */
export const searchKitSummaries = async (
  query: string,
  limit = 40,
): Promise<KitSummary[]> => {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const tokenMatches = (token: string) => {
    const q = `%${token}%`;
    return or(
      like(teams.name, q),
      like(teams.shortName, q),
      like(eras.label, q),
      sql`CAST(${eras.startYear} AS TEXT) LIKE ${q}`,
      sql`CAST(${eras.endYear} AS TEXT) LIKE ${q}`,
      like(manufacturers.name, q),
      like(kits.type, q),
      like(kits.description, q),
    );
  };

  const rows = await selectJoinedKits()
    .where(and(...tokens.map(tokenMatches)))
    .orderBy(desc(eras.startYear))
    .limit(limit);
  return toSummaries(rows);
};

export const getKitDetail = async (
  kitId: string,
): Promise<KitDetail | null> => {
  const rows = await selectJoinedKits().where(eq(kits.id, kitId)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const [summary] = await toSummaries([row]);
  if (!summary) return null;

  const db = getDb();
  const images = await db
    .select()
    .from(kitImages)
    .where(eq(kitImages.kitId, kitId))
    .orderBy(asc(kitImages.sortOrder), asc(kitImages.createdAt));
  const comps = await db
    .select({ competition: competitions })
    .from(kitCompetitions)
    .innerJoin(competitions, eq(kitCompetitions.competitionId, competitions.id))
    .where(eq(kitCompetitions.kitId, kitId));

  return { ...summary, images, competitions: comps.map((c) => c.competition) };
};

// ---------------------------------------------------------------------------
// Catalogue extension (user-created entries)
// ---------------------------------------------------------------------------

export const createTeam = async (
  input: CreateTeamInput,
): Promise<TeamWithCountry> => {
  const id = generateId();
  await getDb()
    .insert(teams)
    .values({
      id,
      name: input.name,
      shortName: input.shortName ?? null,
      countryId: input.countryId,
      type: input.type,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor ?? null,
      source: "user",
    });
  const team = await getTeamById(id);
  if (!team) throw new Error("Failed to create team");
  return team;
};

export const createEra = async (input: CreateEraInput): Promise<Era> => {
  const row: Era = {
    id: generateId(),
    teamId: input.teamId,
    startYear: input.startYear,
    endYear: input.endYear ?? null,
    label: input.label,
    source: "user",
  };
  await getDb().insert(eras).values(row);
  return row;
};

export const createKit = async (input: CreateKitInput): Promise<Kit> => {
  const db = getDb();
  const now = new Date();
  const row: Kit = {
    id: generateId(),
    teamId: input.teamId,
    eraId: input.eraId,
    type: input.type,
    manufacturerId: input.manufacturerId ?? null,
    description: input.description ?? null,
    source: "user",
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(kits).values(row);
  if (input.competitionIds?.length) {
    await db.insert(kitCompetitions).values(
      input.competitionIds.map((competitionId) => ({
        kitId: row.id,
        competitionId,
      })),
    );
  }
  return row;
};

export const updateKit = async (
  kitId: string,
  input: UpdateKitInput,
): Promise<void> => {
  const db = getDb();
  const { competitionIds, ...fields } = input;
  if (Object.keys(fields).length > 0) {
    await db
      .update(kits)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(kits.id, kitId));
  }
  if (competitionIds) {
    await db.delete(kitCompetitions).where(eq(kitCompetitions.kitId, kitId));
    if (competitionIds.length > 0) {
      await db
        .insert(kitCompetitions)
        .values(
          competitionIds.map((competitionId) => ({ kitId, competitionId })),
        );
    }
  }
};

export const createPlayer = async (
  name: string,
  fullName?: string,
): Promise<Player> => {
  const row: Player = {
    id: generateId(),
    name,
    fullName: fullName ?? null,
    source: "user",
  };
  await getDb().insert(players).values(row);
  return row;
};

export const createManufacturer = async (
  name: string,
): Promise<Manufacturer> => {
  const row: Manufacturer = { id: generateId(), name, source: "user" };
  await getDb().insert(manufacturers).values(row);
  return row;
};

// ---------------------------------------------------------------------------
// Reference images
// ---------------------------------------------------------------------------

export const addKitImage = async (
  kitId: string,
  uri: string,
): Promise<KitImage> => {
  const row = {
    id: generateId(),
    kitId,
    uri,
    sortOrder: Date.now(),
    createdAt: new Date(),
  };
  await getDb().insert(kitImages).values(row);
  return row;
};

export const removeKitImage = async (imageId: string): Promise<void> => {
  await getDb().delete(kitImages).where(eq(kitImages.id, imageId));
};

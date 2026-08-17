import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  addons,
  collectionItems,
  eras,
  itemAddons,
  itemPhotos,
  kitImages,
  kits,
  manufacturers,
  players,
  teams,
} from "@/db/schema";
import { generateId } from "@/lib/id";
import { deleteStoredImage } from "@/lib/images";
import type {
  AddPhotoInput,
  CollectionFilters,
  CollectionItem,
  CollectionItemDetail,
  CollectionItemSummary,
  CreateItemInput,
  ItemPhoto,
  UpdateItemInput,
} from "./types";

/** All collection DB access lives here. */

const selectJoinedItems = () =>
  getDb()
    .select({
      item: collectionItems,
      kitType: kits.type,
      teamId: teams.id,
      teamName: teams.name,
      teamPrimaryColor: teams.primaryColor,
      teamSecondaryColor: teams.secondaryColor,
      eraLabel: eras.label,
      playerName: players.name,
    })
    .from(collectionItems)
    .innerJoin(kits, eq(collectionItems.kitId, kits.id))
    .innerJoin(teams, eq(kits.teamId, teams.id))
    .innerJoin(eras, eq(kits.eraId, eras.id))
    .leftJoin(players, eq(collectionItems.playerId, players.id));

type JoinedItemRow = Omit<CollectionItemSummary, "imageUri">;

/** Attach display image: first user photo, else kit reference image. */
const toSummaries = async (
  rows: JoinedItemRow[],
): Promise<CollectionItemSummary[]> => {
  if (rows.length === 0) return [];
  const db = getDb();
  const itemIds = rows.map((r) => r.item.id);
  const kitIds = [...new Set(rows.map((r) => r.item.kitId))];

  const photos = await db
    .select({ itemId: itemPhotos.itemId, uri: itemPhotos.uri })
    .from(itemPhotos)
    .where(inArray(itemPhotos.itemId, itemIds))
    .orderBy(asc(itemPhotos.sortOrder), asc(itemPhotos.createdAt));
  const photoByItem = new Map<string, string>();
  for (const p of photos)
    if (!photoByItem.has(p.itemId)) photoByItem.set(p.itemId, p.uri);

  const refs = await db
    .select({ kitId: kitImages.kitId, uri: kitImages.uri })
    .from(kitImages)
    .where(inArray(kitImages.kitId, kitIds))
    .orderBy(asc(kitImages.sortOrder), asc(kitImages.createdAt));
  const refByKit = new Map<string, string>();
  for (const r of refs)
    if (!refByKit.has(r.kitId)) refByKit.set(r.kitId, r.uri);

  return rows.map((r) => ({
    ...r,
    imageUri: photoByItem.get(r.item.id) ?? refByKit.get(r.item.kitId) ?? null,
  }));
};

export const getItems = async (
  filters: CollectionFilters = {},
): Promise<CollectionItemSummary[]> => {
  const conditions: SQL[] = [
    eq(collectionItems.status, filters.status ?? "owned"),
  ];
  if (filters.teamId) conditions.push(eq(teams.id, filters.teamId));
  if (filters.kitType) conditions.push(eq(kits.type, filters.kitType));
  if (filters.condition)
    conditions.push(eq(collectionItems.condition, filters.condition));

  const rows = await selectJoinedItems()
    .where(and(...conditions))
    .orderBy(desc(collectionItems.createdAt));
  return toSummaries(rows);
};

/** Teams the user has shirts of (for the collection team filter). */
export const getCollectionTeams = async (
  status: "owned" | "sold" = "owned",
): Promise<{ id: string; name: string }[]> =>
  getDb()
    .selectDistinct({ id: teams.id, name: teams.name })
    .from(collectionItems)
    .innerJoin(kits, eq(collectionItems.kitId, kits.id))
    .innerJoin(teams, eq(kits.teamId, teams.id))
    .where(eq(collectionItems.status, status))
    .orderBy(asc(teams.name));

export const getItemsByKit = async (
  kitId: string,
): Promise<CollectionItemSummary[]> => {
  const rows = await selectJoinedItems()
    .where(eq(collectionItems.kitId, kitId))
    .orderBy(desc(collectionItems.createdAt));
  return toSummaries(rows);
};

export const getItemDetail = async (
  itemId: string,
): Promise<CollectionItemDetail | null> => {
  const db = getDb();
  const rows = await selectJoinedItems()
    .where(eq(collectionItems.id, itemId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const [summary] = await toSummaries([row]);
  if (!summary) return null;

  const photos = await db
    .select()
    .from(itemPhotos)
    .where(eq(itemPhotos.itemId, itemId))
    .orderBy(asc(itemPhotos.sortOrder), asc(itemPhotos.createdAt));

  const addonRows = await db
    .select({ addon: addons })
    .from(itemAddons)
    .innerJoin(addons, eq(itemAddons.addonId, addons.id))
    .where(eq(itemAddons.itemId, itemId));

  const player = row.item.playerId
    ? ((
        await db
          .select()
          .from(players)
          .where(eq(players.id, row.item.playerId))
          .limit(1)
      )[0] ?? null)
    : null;

  const manufacturerRows = await db
    .select({ name: manufacturers.name })
    .from(kits)
    .innerJoin(manufacturers, eq(kits.manufacturerId, manufacturers.id))
    .where(eq(kits.id, row.item.kitId))
    .limit(1);

  return {
    ...summary,
    photos,
    addons: addonRows.map((a) => a.addon),
    player,
    manufacturerName: manufacturerRows[0]?.name ?? null,
  };
};

export const createItem = async (
  input: CreateItemInput,
): Promise<CollectionItem> => {
  const db = getDb();
  const now = new Date();
  const { addonIds, ...rest } = input;
  const row: CollectionItem = {
    id: generateId(),
    kitId: rest.kitId,
    status: "owned",
    condition: rest.condition,
    conditionNote: rest.conditionNote ?? null,
    productVersion: rest.productVersion ?? null,
    edition: rest.edition ?? null,
    sleeve: rest.sleeve ?? null,
    backType: rest.backType ?? "blank",
    playerId: rest.playerId ?? null,
    customName: rest.customName ?? null,
    number: rest.number ?? null,
    purchaseDate: rest.purchaseDate ?? null,
    seller: rest.seller ?? null,
    purchasePrice: rest.purchasePrice ?? null,
    currency: rest.currency ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(collectionItems).values(row);
  if (addonIds?.length) {
    await db
      .insert(itemAddons)
      .values(addonIds.map((addonId) => ({ itemId: row.id, addonId })));
  }
  return row;
};

export const updateItem = async (
  itemId: string,
  input: UpdateItemInput,
): Promise<void> => {
  const db = getDb();
  const { addonIds, ...fields } = input;
  if (Object.keys(fields).length > 0) {
    await db
      .update(collectionItems)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(collectionItems.id, itemId));
  }
  if (addonIds) {
    await db.delete(itemAddons).where(eq(itemAddons.itemId, itemId));
    if (addonIds.length > 0) {
      await db
        .insert(itemAddons)
        .values(addonIds.map((addonId) => ({ itemId, addonId })));
    }
  }
};

/** Sold items stay as historical records, hidden from the default view. */
export const markSold = async (itemId: string): Promise<void> => {
  await getDb()
    .update(collectionItems)
    .set({ status: "sold", updatedAt: new Date() })
    .where(eq(collectionItems.id, itemId));
};

export const markOwned = async (itemId: string): Promise<void> => {
  await getDb()
    .update(collectionItems)
    .set({ status: "owned", updatedAt: new Date() })
    .where(eq(collectionItems.id, itemId));
};

/** Hard delete, including stored photo files. */
export const removeItem = async (itemId: string): Promise<void> => {
  const db = getDb();
  const photos = await db
    .select()
    .from(itemPhotos)
    .where(eq(itemPhotos.itemId, itemId));
  await db.delete(collectionItems).where(eq(collectionItems.id, itemId));
  await Promise.all(photos.map((p) => deleteStoredImage(p.uri)));
};

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export const addPhoto = async (input: AddPhotoInput): Promise<ItemPhoto> => {
  const row: ItemPhoto = {
    id: generateId(),
    itemId: input.itemId,
    uri: input.uri,
    kind: input.kind ?? null,
    sortOrder: Date.now(),
    createdAt: new Date(),
  };
  await getDb().insert(itemPhotos).values(row);
  return row;
};

/** Make a photo the item's default (first by sortOrder everywhere). */
export const setDefaultPhoto = async (
  photoId: string,
  itemId: string,
): Promise<void> => {
  const db = getDb();
  const first = await db
    .select({ sortOrder: itemPhotos.sortOrder })
    .from(itemPhotos)
    .where(eq(itemPhotos.itemId, itemId))
    .orderBy(asc(itemPhotos.sortOrder))
    .limit(1);
  const minSort = first[0]?.sortOrder ?? 0;
  await db
    .update(itemPhotos)
    .set({ sortOrder: minSort - 1 })
    .where(eq(itemPhotos.id, photoId));
};

export const removePhoto = async (photoId: string): Promise<void> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(itemPhotos)
    .where(eq(itemPhotos.id, photoId))
    .limit(1);
  await db.delete(itemPhotos).where(eq(itemPhotos.id, photoId));
  const photo = rows[0];
  if (photo) await deleteStoredImage(photo.uri);
};

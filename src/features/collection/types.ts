import type { collectionItems, itemPhotos } from "@/db/schema";
import type {
  BackType,
  Condition,
  Edition,
  KitType,
  PhotoKind,
  ProductVersion,
  SleeveType,
} from "@/config/types";
import type { Addon, Player } from "@/features/catalogue/types";

export type CollectionItem = typeof collectionItems.$inferSelect;
export type ItemPhoto = typeof itemPhotos.$inferSelect;

/** One physical shirt joined with what a collection card needs. */
export interface CollectionItemSummary {
  item: CollectionItem;
  kitType: KitType;
  teamId: string;
  teamName: string;
  teamPrimaryColor: string;
  teamSecondaryColor: string | null;
  eraLabel: string;
  playerName: string | null;
  /** First user photo, falling back to the kit's first reference image. */
  imageUri: string | null;
}

export interface CollectionItemDetail extends CollectionItemSummary {
  photos: ItemPhoto[];
  addons: Addon[];
  player: Player | null;
  manufacturerName: string | null;
}

export interface CollectionFilters {
  teamId?: string | undefined;
  kitType?: KitType | undefined;
  condition?: Condition | undefined;
  /** Defaults to 'owned' — sold items are hidden unless asked for (spec §26). */
  status?: "owned" | "sold" | undefined;
}

export interface CreateItemInput {
  kitId: string;
  condition: Condition;
  conditionNote?: string;
  productVersion?: ProductVersion;
  edition?: Edition;
  sleeve?: SleeveType;
  backType?: BackType;
  playerId?: string;
  customName?: string;
  number?: number;
  purchaseDate?: Date;
  seller?: string;
  purchasePrice?: number;
  currency?: string;
  addonIds?: string[];
}

export interface UpdateItemInput {
  condition?: Condition;
  conditionNote?: string | null;
  productVersion?: ProductVersion | null;
  edition?: Edition | null;
  sleeve?: SleeveType | null;
  backType?: BackType;
  playerId?: string | null;
  customName?: string | null;
  number?: number | null;
  purchaseDate?: Date | null;
  seller?: string | null;
  purchasePrice?: number | null;
  currency?: string | null;
  addonIds?: string[];
}

export interface AddPhotoInput {
  itemId: string;
  uri: string;
  kind?: PhotoKind;
}

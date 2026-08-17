import { create } from "zustand";
import * as service from "./collectionService";
import { syncWidget } from "@/lib/widget";
import type {
  AddPhotoInput,
  CollectionFilters,
  CollectionItem,
  CollectionItemDetail,
  CollectionItemSummary,
  CreateItemInput,
  UpdateItemInput,
} from "./types";

interface State {
  items: CollectionItemSummary[];
  /** Teams present in the collection (for the team filter chips). */
  teams: { id: string; name: string }[];
  filters: CollectionFilters;
  itemDetail: CollectionItemDetail | null;
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  setFilters: (filters: CollectionFilters) => Promise<void>;
  loadItemDetail: (itemId: string) => Promise<void>;

  add: (input: CreateItemInput) => Promise<CollectionItem>;
  edit: (itemId: string, input: UpdateItemInput) => Promise<void>;
  markSold: (itemId: string) => Promise<void>;
  markOwned: (itemId: string) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  addPhoto: (input: AddPhotoInput) => Promise<void>;
  removePhoto: (photoId: string, itemId: string) => Promise<void>;
  setDefaultPhoto: (photoId: string, itemId: string) => Promise<void>;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Zustand store wrapping the collection service; the only thing UI talks to. */
export const useCollectionStore = create<State>((set, get) => ({
  items: [],
  teams: [],
  filters: {},
  itemDetail: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const filters = get().filters;
      const [items, teams] = await Promise.all([
        service.getItems(filters),
        service.getCollectionTeams(filters.status ?? "owned"),
      ]);
      set({ items, teams, isLoading: false });
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  setFilters: async (filters) => {
    set({ filters });
    await get().load();
  },

  loadItemDetail: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      set({
        itemDetail: await service.getItemDetail(itemId),
        isLoading: false,
      });
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  add: async (input) => {
    const item = await service.createItem(input);
    await get().load();
    void syncWidget();
    return item;
  },

  edit: async (itemId, input) => {
    await service.updateItem(itemId, input);
    await Promise.all([get().load(), get().loadItemDetail(itemId)]);
  },

  markSold: async (itemId) => {
    await service.markSold(itemId);
    await get().load();
    void syncWidget();
  },

  markOwned: async (itemId) => {
    await service.markOwned(itemId);
    await get().load();
    void syncWidget();
  },

  remove: async (itemId) => {
    await service.removeItem(itemId);
    set({ itemDetail: null });
    await get().load();
    void syncWidget();
  },

  addPhoto: async (input) => {
    await service.addPhoto(input);
    await get().loadItemDetail(input.itemId);
  },

  removePhoto: async (photoId, itemId) => {
    await service.removePhoto(photoId);
    await get().loadItemDetail(itemId);
  },

  setDefaultPhoto: async (photoId, itemId) => {
    await service.setDefaultPhoto(photoId, itemId);
    await get().loadItemDetail(itemId);
  },
}));

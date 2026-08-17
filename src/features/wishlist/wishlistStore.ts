import { create } from "zustand";
import * as service from "./wishlistService";
import type { WishlistConfigInput, WishlistEntry } from "./types";

interface State {
  entries: WishlistEntry[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (kitId: string, config?: WishlistConfigInput) => Promise<void>;
  updateConfig: (kitId: string, config: WishlistConfigInput) => Promise<void>;
  removeByKit: (kitId: string) => Promise<void>;
  isWishlisted: (kitId: string) => boolean;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Zustand store wrapping the wishlist service; the only thing UI talks to. */
export const useWishlistStore = create<State>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ entries: await service.getEntries(), isLoading: false });
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  add: async (kitId, config = {}) => {
    await service.add(kitId, config);
    await get().load();
  },

  updateConfig: async (kitId, config) => {
    await service.updateConfig(kitId, config);
    await get().load();
  },

  removeByKit: async (kitId) => {
    await service.removeByKit(kitId);
    await get().load();
  },

  isWishlisted: (kitId) => get().entries.some((e) => e.entry.kitId === kitId),
}));

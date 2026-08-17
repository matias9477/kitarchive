import { create } from "zustand";
import * as service from "./searchService";
import type { GlobalSearchResults } from "./types";

interface State {
  query: string;
  results: GlobalSearchResults | null;
  isSearching: boolean;
  error: string | null;

  search: (query: string) => Promise<void>;
  clear: () => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Zustand store wrapping the search service; the only thing UI talks to. */
export const useSearchStore = create<State>((set) => ({
  query: "",
  results: null,
  isSearching: false,
  error: null,

  search: async (query) => {
    set({ query, isSearching: true, error: null });
    try {
      const results = await service.searchGlobal(query);
      set({ results, isSearching: false });
    } catch (error) {
      set({ error: message(error), isSearching: false });
    }
  },

  clear: () => set({ query: "", results: null, error: null }),
}));

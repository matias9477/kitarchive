import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SortOption = "dateDescending" | "dateAscending" | "alphabetical";

export interface PreferencesState {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sortOption: "dateDescending",
      setSortOption: (option) => set({ sortOption: option }),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SortOption = "dateDescending" | "dateAscending" | "alphabetical";

export interface PreferencesState {
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  /** Teams featured on the dashboard (stat tiles + archive progress). */
  favoriteTeamIds: string[];
  toggleFavoriteTeam: (teamId: string) => void;
  isFavoriteTeam: (teamId: string) => boolean;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      sortOption: "dateDescending",
      setSortOption: (option) => set({ sortOption: option }),
      // Starts empty — only teams the user stars appear on the dashboard.
      favoriteTeamIds: [],
      toggleFavoriteTeam: (teamId) =>
        set((state) => ({
          favoriteTeamIds: state.favoriteTeamIds.includes(teamId)
            ? state.favoriteTeamIds.filter((id) => id !== teamId)
            : [...state.favoriteTeamIds, teamId],
        })),
      isFavoriteTeam: (teamId) => get().favoriteTeamIds.includes(teamId),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // v1: favorites briefly shipped pre-seeded with Boca/Argentina; wipe
      // that persisted default so favorites are purely user-chosen.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as Partial<PreferencesState>;
        return version < 1 ? { ...state, favoriteTeamIds: [] } : state;
      },
    },
  ),
);

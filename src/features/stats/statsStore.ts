import { create } from "zustand";
import * as service from "./statsService";
import type { DashboardStats, TeamProgress } from "./types";

interface State {
  dashboard: DashboardStats | null;
  progressByTeam: Record<string, TeamProgress>;
  isLoading: boolean;
  error: string | null;

  loadDashboard: () => Promise<void>;
  loadTeamProgress: (teamId: string) => Promise<void>;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Zustand store wrapping the stats service; the only thing UI talks to. */
export const useStatsStore = create<State>((set) => ({
  dashboard: null,
  progressByTeam: {},
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ dashboard: await service.getDashboardStats(), isLoading: false });
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  loadTeamProgress: async (teamId) => {
    try {
      const progress = await service.getTeamProgress(teamId);
      if (progress) {
        set((s) => ({
          progressByTeam: { ...s.progressByTeam, [teamId]: progress },
        }));
      }
    } catch (error) {
      set({ error: message(error) });
    }
  },
}));

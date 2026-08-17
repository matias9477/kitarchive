import { create } from "zustand";
import * as service from "./catalogueService";
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
  KitSummary,
  Manufacturer,
  Player,
  TeamWithCountry,
} from "./types";

interface State {
  teams: TeamWithCountry[];
  countries: Country[];
  manufacturers: Manufacturer[];
  competitions: Competition[];
  players: Player[];
  addons: Addon[];
  /** Per-team browse data, loaded on demand. */
  erasByTeam: Record<string, Era[]>;
  kitsByTeam: Record<string, KitSummary[]>;
  kitDetail: KitDetail | null;
  isLoading: boolean;
  error: string | null;

  loadTeams: () => Promise<void>;
  loadLookups: () => Promise<void>;
  loadTeamCatalogue: (teamId: string) => Promise<void>;
  loadKitDetail: (kitId: string) => Promise<void>;

  createTeam: (input: CreateTeamInput) => Promise<TeamWithCountry>;
  createEra: (input: CreateEraInput) => Promise<Era>;
  createKit: (input: CreateKitInput) => Promise<Kit>;
  createPlayer: (name: string, fullName?: string) => Promise<Player>;
  addKitImage: (kitId: string, uri: string) => Promise<void>;
  removeKitImage: (imageId: string, kitId: string) => Promise<void>;
  setDefaultKitImage: (imageId: string, kitId: string) => Promise<void>;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Zustand store wrapping the catalogue service; the only thing UI talks to. */
export const useCatalogueStore = create<State>((set, get) => ({
  teams: [],
  countries: [],
  manufacturers: [],
  competitions: [],
  players: [],
  addons: [],
  erasByTeam: {},
  kitsByTeam: {},
  kitDetail: null,
  isLoading: false,
  error: null,

  loadTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ teams: await service.getTeams(), isLoading: false });
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  loadLookups: async () => {
    try {
      const [countries, manufacturers, competitions, players, addons] =
        await Promise.all([
          service.getCountries(),
          service.getManufacturers(),
          service.getCompetitions(),
          service.getPlayers(),
          service.getAddons(),
        ]);
      set({ countries, manufacturers, competitions, players, addons });
    } catch (error) {
      set({ error: message(error) });
    }
  },

  loadTeamCatalogue: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const [teamEras, teamKits] = await Promise.all([
        service.getEras(teamId),
        service.getKitSummariesByTeam(teamId),
      ]);
      set((s) => ({
        erasByTeam: { ...s.erasByTeam, [teamId]: teamEras },
        kitsByTeam: { ...s.kitsByTeam, [teamId]: teamKits },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  loadKitDetail: async (kitId) => {
    set({ isLoading: true, error: null });
    try {
      set({ kitDetail: await service.getKitDetail(kitId), isLoading: false });
    } catch (error) {
      set({ error: message(error), isLoading: false });
    }
  },

  createTeam: async (input) => {
    const team = await service.createTeam(input);
    await get().loadTeams();
    return team;
  },

  createEra: async (input) => {
    const era = await service.createEra(input);
    await get().loadTeamCatalogue(input.teamId);
    return era;
  },

  createKit: async (input) => {
    const kit = await service.createKit(input);
    await get().loadTeamCatalogue(input.teamId);
    return kit;
  },

  createPlayer: async (name, fullName) => {
    const player = await service.createPlayer(name, fullName);
    set((s) => ({
      players: [...s.players, player].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
    return player;
  },

  addKitImage: async (kitId, uri) => {
    await service.addKitImage(kitId, uri);
    await get().loadKitDetail(kitId);
  },

  removeKitImage: async (imageId, kitId) => {
    await service.removeKitImage(imageId);
    await get().loadKitDetail(kitId);
  },

  setDefaultKitImage: async (imageId, kitId) => {
    await service.setDefaultKitImage(imageId, kitId);
    await get().loadKitDetail(kitId);
  },
}));

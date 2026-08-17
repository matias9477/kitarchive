import type {
  addons,
  competitions,
  countries,
  eras,
  kitCompetitions,
  kits,
  manufacturers,
  players,
  teams,
} from "@/db/schema";

export type CountrySeed = typeof countries.$inferInsert;
export type TeamSeed = typeof teams.$inferInsert;
export type EraSeed = typeof eras.$inferInsert;
export type ManufacturerSeed = typeof manufacturers.$inferInsert;
export type CompetitionSeed = typeof competitions.$inferInsert;
export type KitSeed = typeof kits.$inferInsert;
export type KitCompetitionSeed = typeof kitCompetitions.$inferInsert;
export type AddonSeed = typeof addons.$inferInsert;
export type PlayerSeed = typeof players.$inferInsert;

export interface SeedBundle {
  countries: CountrySeed[];
  manufacturers: ManufacturerSeed[];
  competitions: CompetitionSeed[];
  addons: AddonSeed[];
  players: PlayerSeed[];
  teams: TeamSeed[];
  eras: EraSeed[];
  kits: KitSeed[];
  kitCompetitions: KitCompetitionSeed[];
}

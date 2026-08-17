import type { KitType } from "@/config/types";
import type { EraSeed, KitCompetitionSeed, KitSeed } from "./types";

/**
 * Boca Juniors seasons 1995/96 → 2024/25 with home/away kits.
 * Best-effort historical data (spec §37) — correct in-app as needed; the
 * seeder never overwrites existing rows. Manufacturers: Olan (1995/96),
 * Nike (1996/97–2023/24), Adidas (2024/25–).
 */

const TEAM = "boca-juniors";

const eraId = (start: number) =>
  `${TEAM}-${start}-${String((start + 1) % 100).padStart(2, "0")}`;

const label = (start: number) =>
  `${start}/${String((start + 1) % 100).padStart(2, "0")}`;

const manufacturerFor = (start: number): string => {
  if (start <= 1995) return "olan";
  if (start <= 2023) return "nike";
  return "adidas";
};

const SEASON_STARTS = Array.from({ length: 30 }, (_, i) => 1995 + i); // 1995/96 … 2024/25

export const bocaEraSeeds: EraSeed[] = SEASON_STARTS.map((start) => ({
  id: eraId(start),
  teamId: TEAM,
  startYear: start,
  endYear: start + 1,
  label: label(start),
  source: "seed",
}));

const NOTES: Record<string, Partial<Record<KitType, string>>> = {
  [eraId(2000)]: {
    home: "Worn winning the 2000 Copa Libertadores and Intercontinental Cup.",
  },
  [eraId(2001)]: { home: "Season of Maradona's farewell match (10 Nov 2001)." },
  [eraId(2003)]: {
    home: "Worn winning the 2003 Copa Libertadores and Intercontinental Cup.",
  },
  [eraId(2007)]: { home: "Worn winning the 2007 Copa Libertadores." },
};

const kit = (start: number, type: KitType, description?: string): KitSeed => ({
  id: `${eraId(start)}-${type}`,
  teamId: TEAM,
  eraId: eraId(start),
  type,
  manufacturerId: manufacturerFor(start),
  description: description ?? NOTES[eraId(start)]?.[type] ?? null,
  source: "seed",
});

export const bocaKitSeeds: KitSeed[] = [
  ...SEASON_STARTS.flatMap((start) => [kit(start, "home"), kit(start, "away")]),
  kit(2004, "special", "Club centenary shirt (1905–2005)."),
];

export const bocaKitCompetitionSeeds: KitCompetitionSeed[] = [
  { kitId: `${eraId(2000)}-home`, competitionId: "copa-libertadores" },
  { kitId: `${eraId(2000)}-home`, competitionId: "intercontinental-cup" },
  { kitId: `${eraId(2003)}-home`, competitionId: "copa-libertadores" },
  { kitId: `${eraId(2003)}-home`, competitionId: "intercontinental-cup" },
  { kitId: `${eraId(2007)}-home`, competitionId: "copa-libertadores" },
];

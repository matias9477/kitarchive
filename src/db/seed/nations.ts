import type { EraSeed, KitSeed } from "./types";

/**
 * Recent kit cycles (2018+) for the other top national teams — lighter
 * coverage than the primary collections, expanded later in-app or by seed
 * bumps. Cycles are the common two-year tournament rhythm.
 */

interface NationCycles {
  teamId: string;
  /** manufacturer per cycle start year */
  manufacturer: (start: number) => string;
}

const NATIONS: NationCycles[] = [
  { teamId: "brazil", manufacturer: () => "nike" },
  { teamId: "uruguay", manufacturer: (s) => (s >= 2024 ? "nike" : "puma") },
  { teamId: "england", manufacturer: () => "nike" },
  { teamId: "france", manufacturer: () => "nike" },
  { teamId: "germany", manufacturer: () => "adidas" },
  { teamId: "italy", manufacturer: (s) => (s >= 2023 ? "adidas" : "puma") },
  { teamId: "spain", manufacturer: () => "adidas" },
  { teamId: "netherlands", manufacturer: () => "nike" },
  { teamId: "portugal", manufacturer: () => "nike" },
];

const CYCLE_STARTS = [2018, 2020, 2022, 2024];

const eraId = (teamId: string, start: number) =>
  `${teamId}-${start}-${start + 1}`;
const label = (start: number) =>
  `${start}–${String((start + 1) % 100).padStart(2, "0")}`;

export const nationEraSeeds: EraSeed[] = NATIONS.flatMap(({ teamId }) =>
  CYCLE_STARTS.map((start) => ({
    id: eraId(teamId, start),
    teamId,
    startYear: start,
    endYear: start + 1,
    label: label(start),
    source: "seed" as const,
  })),
);

export const nationKitSeeds: KitSeed[] = NATIONS.flatMap(
  ({ teamId, manufacturer }) =>
    CYCLE_STARTS.flatMap((start) =>
      (["home", "away"] as const).map((type) => ({
        id: `${eraId(teamId, start)}-${type}`,
        teamId,
        eraId: eraId(teamId, start),
        type,
        manufacturerId: manufacturer(start),
        source: "seed" as const,
      })),
    ),
);

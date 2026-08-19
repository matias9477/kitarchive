import { LATEST_SEASON_START } from "./season";
import { NATION_ROWS } from "./world";
import type { EraSeed, KitSeed } from "./types";

/**
 * Kit cycles for every national team in world.ts except Argentina (which has
 * its own curated history in argentina.ts). Cycles are the common two-year
 * tournament rhythm, 2014 → present, home/away, with best-effort
 * manufacturers where world.ts knows them.
 */

const CYCLE_NATIONS = NATION_ROWS.filter((row) => row.id !== "argentina");

// Even-year tournament cycles from 2014 up to the current horizon.
const CYCLE_STARTS = Array.from(
  { length: Math.floor((LATEST_SEASON_START - 2014) / 2) + 1 },
  (_, i) => 2014 + i * 2,
);

const eraId = (teamId: string, start: number) =>
  `${teamId}-${start}-${start + 1}`;
const label = (start: number) =>
  `${start}–${String((start + 1) % 100).padStart(2, "0")}`;

const manufacturerFor = (
  row: (typeof NATION_ROWS)[number],
  start: number,
): string | null =>
  typeof row.manufacturer === "function"
    ? row.manufacturer(start)
    : (row.manufacturer ?? null);

export const nationEraSeeds: EraSeed[] = CYCLE_NATIONS.flatMap((row) =>
  CYCLE_STARTS.map((start) => ({
    id: eraId(row.id, start),
    teamId: row.id,
    startYear: start,
    endYear: start + 1,
    label: label(start),
    source: "seed" as const,
  })),
);

export const nationKitSeeds: KitSeed[] = CYCLE_NATIONS.flatMap((row) =>
  CYCLE_STARTS.flatMap((start) =>
    (["home", "away"] as const).map((type) => ({
      id: `${eraId(row.id, start)}-${type}`,
      teamId: row.id,
      eraId: eraId(row.id, start),
      type,
      manufacturerId: manufacturerFor(row, start),
      source: "seed" as const,
    })),
  ),
);

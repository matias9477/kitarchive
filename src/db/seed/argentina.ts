import type { EraSeed, KitCompetitionSeed, KitSeed } from "./types";

/**
 * Argentina national-team kit cycles ~1990 → 2026 with home/away kits.
 * Cycles follow shirt releases, not club seasons (spec §7.2). Best-effort
 * data — correct in-app; the seeder never overwrites existing rows.
 */

const TEAM = "argentina";

interface Cycle {
  start: number;
  end: number;
  manufacturerId: string;
  note?: string;
  competitions?: string[];
}

const CYCLES: Cycle[] = [
  {
    start: 1990,
    end: 1991,
    manufacturerId: "adidas",
    note: "Italia 90 World Cup cycle.",
    competitions: ["world-cup"],
  },
  {
    start: 1991,
    end: 1993,
    manufacturerId: "adidas",
    note: "Copa América 1991 and 1993 champions.",
    competitions: ["copa-america"],
  },
  {
    start: 1994,
    end: 1995,
    manufacturerId: "adidas",
    note: "USA 94 World Cup cycle.",
    competitions: ["world-cup"],
  },
  { start: 1996, end: 1997, manufacturerId: "adidas" },
  {
    start: 1998,
    end: 1999,
    manufacturerId: "adidas",
    note: "France 98 World Cup cycle.",
    competitions: ["world-cup"],
  },
  {
    start: 1999,
    end: 2000,
    manufacturerId: "reebok",
    note: "Brief Reebok era.",
  },
  { start: 2000, end: 2001, manufacturerId: "adidas" },
  {
    start: 2002,
    end: 2003,
    manufacturerId: "adidas",
    note: "Korea/Japan 2002 World Cup cycle.",
    competitions: ["world-cup"],
  },
  {
    start: 2004,
    end: 2005,
    manufacturerId: "adidas",
    note: "2004 Copa América final.",
    competitions: ["copa-america"],
  },
  {
    start: 2006,
    end: 2007,
    manufacturerId: "adidas",
    note: "Germany 2006 World Cup; 2007 Copa América final.",
    competitions: ["world-cup", "copa-america"],
  },
  { start: 2008, end: 2009, manufacturerId: "adidas" },
  {
    start: 2010,
    end: 2011,
    manufacturerId: "adidas",
    note: "South Africa 2010 World Cup; 2011 Copa América hosts.",
    competitions: ["world-cup", "copa-america"],
  },
  { start: 2011, end: 2013, manufacturerId: "adidas" },
  {
    start: 2013,
    end: 2014,
    manufacturerId: "adidas",
    note: "Brazil 2014 World Cup cycle (final).",
    competitions: ["world-cup"],
  },
  {
    start: 2014,
    end: 2015,
    manufacturerId: "adidas",
    note: "2015 Copa América final.",
    competitions: ["copa-america"],
  },
  {
    start: 2015,
    end: 2016,
    manufacturerId: "adidas",
    note: "Copa América Centenario final.",
    competitions: ["copa-america"],
  },
  { start: 2016, end: 2017, manufacturerId: "adidas" },
  {
    start: 2017,
    end: 2018,
    manufacturerId: "adidas",
    note: "Russia 2018 World Cup cycle.",
    competitions: ["world-cup"],
  },
  {
    start: 2019,
    end: 2020,
    manufacturerId: "adidas",
    note: "2019 Copa América.",
    competitions: ["copa-america"],
  },
  {
    start: 2020,
    end: 2021,
    manufacturerId: "adidas",
    note: "2021 Copa América champions.",
    competitions: ["copa-america"],
  },
  {
    start: 2021,
    end: 2022,
    manufacturerId: "adidas",
    note: "2022 Finalissima champions.",
    competitions: ["finalissima"],
  },
  {
    start: 2022,
    end: 2023,
    manufacturerId: "adidas",
    note: "Qatar 2022 — World Champions.",
    competitions: ["world-cup"],
  },
  {
    start: 2023,
    end: 2024,
    manufacturerId: "adidas",
    note: "Three-star shirt after Qatar 2022.",
  },
  {
    start: 2024,
    end: 2025,
    manufacturerId: "adidas",
    note: "2024 Copa América champions.",
    competitions: ["copa-america"],
  },
  {
    start: 2025,
    end: 2026,
    manufacturerId: "adidas",
    note: "2026 World Cup cycle.",
    competitions: ["world-cup"],
  },
];

const cycleLabel = ({ start, end }: Cycle) => {
  const shortEnd =
    Math.floor(start / 100) === Math.floor(end / 100)
      ? String(end % 100).padStart(2, "0")
      : String(end);
  return `${start}–${shortEnd}`;
};

const cycleEraId = ({ start, end }: Cycle) => `${TEAM}-${start}-${end}`;

export const argentinaEraSeeds: EraSeed[] = CYCLES.map((c) => ({
  id: cycleEraId(c),
  teamId: TEAM,
  startYear: c.start,
  endYear: c.end,
  label: cycleLabel(c),
  source: "seed",
}));

export const argentinaKitSeeds: KitSeed[] = CYCLES.flatMap((c) =>
  (["home", "away"] as const).map((type) => ({
    id: `${cycleEraId(c)}-${type}`,
    teamId: TEAM,
    eraId: cycleEraId(c),
    type,
    manufacturerId: c.manufacturerId,
    description: type === "home" ? (c.note ?? null) : null,
    source: "seed" as const,
  })),
);

export const argentinaKitCompetitionSeeds: KitCompetitionSeed[] =
  CYCLES.flatMap((c) =>
    (c.competitions ?? []).flatMap((competitionId) => [
      { kitId: `${cycleEraId(c)}-home`, competitionId },
      { kitId: `${cycleEraId(c)}-away`, competitionId },
    ]),
  );

import {
  addonSeeds,
  competitionSeeds,
  countrySeeds,
  manufacturerSeeds,
  playerSeeds,
  teamSeeds,
} from "../core";
import { bocaEraSeeds, bocaKitCompetitionSeeds, bocaKitSeeds } from "../boca";
import {
  argentinaEraSeeds,
  argentinaKitCompetitionSeeds,
  argentinaKitSeeds,
} from "../argentina";
import { nationEraSeeds, nationKitSeeds } from "../nations";

const eras = [...bocaEraSeeds, ...argentinaEraSeeds, ...nationEraSeeds];
const kits = [...bocaKitSeeds, ...argentinaKitSeeds, ...nationKitSeeds];
const kitCompetitions = [
  ...bocaKitCompetitionSeeds,
  ...argentinaKitCompetitionSeeds,
];

const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

describe("catalogue seed integrity", () => {
  it("has unique ids within every entity", () => {
    for (const rows of [
      countrySeeds,
      manufacturerSeeds,
      competitionSeeds,
      addonSeeds,
      playerSeeds,
      teamSeeds,
      eras,
      kits,
    ]) {
      const list = ids(rows);
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("teams reference existing countries", () => {
    const countryIds = new Set(ids(countrySeeds));
    for (const team of teamSeeds) expect(countryIds).toContain(team.countryId);
  });

  it("eras reference existing teams", () => {
    const teamIds = new Set(ids(teamSeeds));
    for (const era of eras) expect(teamIds).toContain(era.teamId);
  });

  it("kits reference existing teams, eras and manufacturers", () => {
    const teamIds = new Set(ids(teamSeeds));
    const eraIds = new Set(ids(eras));
    const manufacturerIds = new Set(ids(manufacturerSeeds));
    for (const kit of kits) {
      expect(teamIds).toContain(kit.teamId);
      expect(eraIds).toContain(kit.eraId);
      if (kit.manufacturerId)
        expect(manufacturerIds).toContain(kit.manufacturerId);
    }
  });

  it("kits belong to their era's team", () => {
    const eraTeamById = new Map(eras.map((era) => [era.id, era.teamId]));
    for (const kit of kits) expect(eraTeamById.get(kit.eraId)).toBe(kit.teamId);
  });

  it("kit-competition links reference existing kits and competitions", () => {
    const kitIds = new Set(ids(kits));
    const competitionIds = new Set(ids(competitionSeeds));
    for (const link of kitCompetitions) {
      expect(kitIds).toContain(link.kitId);
      expect(competitionIds).toContain(link.competitionId);
    }
  });

  it("addons reference existing competitions", () => {
    const competitionIds = new Set(ids(competitionSeeds));
    for (const addon of addonSeeds) {
      if (addon.competitionId)
        expect(competitionIds).toContain(addon.competitionId);
    }
  });

  it("covers the primary collections deeply", () => {
    expect(
      kits.filter((k) => k.teamId === "boca-juniors").length,
    ).toBeGreaterThanOrEqual(60);
    expect(
      kits.filter((k) => k.teamId === "argentina").length,
    ).toBeGreaterThanOrEqual(48);
  });

  it("season seeds extend to the current year (next season available)", () => {
    const year = new Date().getFullYear();
    expect(bocaEraSeeds.some((era) => era.startYear === year)).toBe(true);
    expect(argentinaEraSeeds.some((era) => (era.endYear ?? 0) >= year)).toBe(
      true,
    );
    // Nations run on even-year cycles, so the latest start is at most 1 back.
    const latestNationStart = Math.max(
      ...nationEraSeeds.map((era) => era.startYear),
    );
    expect(latestNationStart).toBeGreaterThanOrEqual(year - 1);
  });

  it("every widget picker team exists in the seed", () => {
    // Keep in sync with the teamId enum values in app.json (expo-widgets).
    const appJson = require("../../../../app.json");
    const plugins: unknown[][] = appJson.expo.plugins;
    const widgets = plugins.find(
      (p): p is [string, { widgets: unknown[] }] =>
        Array.isArray(p) && p[0] === "expo-widgets",
    );
    expect(widgets).toBeDefined();
    if (!widgets) return;
    const config = (
      widgets[1] as {
        widgets: {
          ios: {
            configuration: {
              parameters: { teamId: { values: { value: string }[] } };
            };
          };
        }[];
      }
    ).widgets[0];
    expect(config).toBeDefined();
    if (!config) return;
    // Enum values must be Swift identifiers, so they are seed team IDs with
    // '-' replaced by '_' (decoded the same way in KitsWidget.tsx).
    const teamIds = new Set(ids(teamSeeds).map((id) => id.replace(/-/g, "_")));
    for (const { value } of config.ios.configuration.parameters.teamId.values) {
      expect(value).toMatch(/^[A-Za-z_][A-Za-z0-9_]*$/);
      expect(teamIds).toContain(value);
    }
  });
});

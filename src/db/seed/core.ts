import type {
  AddonSeed,
  CompetitionSeed,
  CountrySeed,
  ManufacturerSeed,
  PlayerSeed,
  TeamSeed,
} from "./types";

/**
 * Shared reference data. IDs are stable slugs — never change an ID once
 * shipped; the seeder matches on them across versions.
 */

const seed = { source: "seed" as const };

export const countrySeeds: CountrySeed[] = [
  { id: "ar", name: "Argentina", flagEmoji: "🇦🇷", ...seed },
  { id: "br", name: "Brazil", flagEmoji: "🇧🇷", ...seed },
  { id: "uy", name: "Uruguay", flagEmoji: "🇺🇾", ...seed },
  { id: "en", name: "England", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ...seed },
  { id: "fr", name: "France", flagEmoji: "🇫🇷", ...seed },
  { id: "de", name: "Germany", flagEmoji: "🇩🇪", ...seed },
  { id: "it", name: "Italy", flagEmoji: "🇮🇹", ...seed },
  { id: "es", name: "Spain", flagEmoji: "🇪🇸", ...seed },
  { id: "nl", name: "Netherlands", flagEmoji: "🇳🇱", ...seed },
  { id: "pt", name: "Portugal", flagEmoji: "🇵🇹", ...seed },
];

export const manufacturerSeeds: ManufacturerSeed[] = [
  { id: "adidas", name: "Adidas", ...seed },
  { id: "nike", name: "Nike", ...seed },
  { id: "puma", name: "Puma", ...seed },
  { id: "umbro", name: "Umbro", ...seed },
  { id: "reebok", name: "Reebok", ...seed },
  { id: "topper", name: "Topper", ...seed },
  { id: "olan", name: "Olan", ...seed },
  { id: "le-coq-sportif", name: "Le Coq Sportif", ...seed },
  { id: "lotto", name: "Lotto", ...seed },
  { id: "kappa", name: "Kappa", ...seed },
  { id: "new-balance", name: "New Balance", ...seed },
  { id: "macron", name: "Macron", ...seed },
  { id: "hummel", name: "Hummel", ...seed },
  { id: "joma", name: "Joma", ...seed },
  { id: "marathon", name: "Marathon", ...seed },
];

export const competitionSeeds: CompetitionSeed[] = [
  { id: "primera-division", name: "Primera División (Argentina)", ...seed },
  { id: "copa-libertadores", name: "Copa Libertadores", ...seed },
  { id: "copa-sudamericana", name: "Copa Sudamericana", ...seed },
  { id: "intercontinental-cup", name: "Intercontinental Cup", ...seed },
  { id: "club-world-cup", name: "FIFA Club World Cup", ...seed },
  { id: "world-cup", name: "FIFA World Cup", ...seed },
  { id: "copa-america", name: "Copa América", ...seed },
  { id: "uefa-euro", name: "UEFA Euro", ...seed },
  { id: "finalissima", name: "Finalissima", ...seed },
];

export const addonSeeds: AddonSeed[] = [
  {
    id: "patch-libertadores",
    name: "Copa Libertadores patch",
    type: "competition_patch",
    competitionId: "copa-libertadores",
    ...seed,
  },
  {
    id: "patch-libertadores-champion",
    name: "Copa Libertadores champion patch",
    type: "champion_patch",
    competitionId: "copa-libertadores",
    ...seed,
  },
  {
    id: "patch-sudamericana",
    name: "Copa Sudamericana patch",
    type: "competition_patch",
    competitionId: "copa-sudamericana",
    ...seed,
  },
  {
    id: "patch-primera-champion",
    name: "Primera División champion patch",
    type: "champion_patch",
    competitionId: "primera-division",
    ...seed,
  },
  {
    id: "patch-world-champion",
    name: "World Champions badge",
    type: "champion_patch",
    competitionId: "world-cup",
    ...seed,
  },
  {
    id: "patch-world-cup",
    name: "World Cup patch",
    type: "competition_patch",
    competitionId: "world-cup",
    ...seed,
  },
  {
    id: "patch-copa-america",
    name: "Copa América patch",
    type: "competition_patch",
    competitionId: "copa-america",
    ...seed,
  },
  {
    id: "patch-copa-america-champion",
    name: "Copa América champion patch",
    type: "champion_patch",
    competitionId: "copa-america",
    ...seed,
  },
  {
    id: "patch-intercontinental-champion",
    name: "Intercontinental champion patch",
    type: "champion_patch",
    competitionId: "intercontinental-cup",
    ...seed,
  },
  {
    id: "marking-anniversary",
    name: "Anniversary marking",
    type: "anniversary",
    ...seed,
  },
];

export const playerSeeds: PlayerSeed[] = [
  {
    id: "riquelme",
    name: "Riquelme",
    fullName: "Juan Román Riquelme",
    ...seed,
  },
  { id: "palermo", name: "Palermo", fullName: "Martín Palermo", ...seed },
  {
    id: "maradona",
    name: "Maradona",
    fullName: "Diego Armando Maradona",
    ...seed,
  },
  { id: "tevez", name: "Tevez", fullName: "Carlos Alberto Tevez", ...seed },
  {
    id: "barros-schelotto",
    name: "Barros Schelotto",
    fullName: "Guillermo Barros Schelotto",
    ...seed,
  },
  {
    id: "battaglia",
    name: "Battaglia",
    fullName: "Sebastián Battaglia",
    ...seed,
  },
  { id: "messi", name: "Messi", fullName: "Lionel Andrés Messi", ...seed },
  {
    id: "batistuta",
    name: "Batistuta",
    fullName: "Gabriel Omar Batistuta",
    ...seed,
  },
  { id: "di-maria", name: "Di María", fullName: "Ángel Di María", ...seed },
  { id: "veron", name: "Verón", fullName: "Juan Sebastián Verón", ...seed },
  { id: "cavani", name: "Cavani", fullName: "Edinson Cavani", ...seed },
];

const club = (
  id: string,
  name: string,
  primaryColor: string,
  secondaryColor: string,
  shortName?: string,
): TeamSeed => ({
  id,
  name,
  countryId: "ar",
  type: "club",
  primaryColor,
  secondaryColor,
  ...(shortName ? { shortName } : {}),
  ...seed,
});

const national = (
  id: string,
  name: string,
  countryId: string,
  primaryColor: string,
  secondaryColor: string,
): TeamSeed => ({
  id,
  name,
  countryId,
  type: "national",
  primaryColor,
  secondaryColor,
  ...seed,
});

export const teamSeeds: TeamSeed[] = [
  // Primary collections
  club("boca-juniors", "Boca Juniors", "#0d3b7d", "#f6b40e", "Boca"),
  national("argentina", "Argentina", "ar", "#75aadb", "#ffffff"),

  // Top national teams
  national("brazil", "Brazil", "br", "#ffdf00", "#009c3b"),
  national("uruguay", "Uruguay", "uy", "#55b5e5", "#0b0f10"),
  national("england", "England", "en", "#ffffff", "#001d48"),
  national("france", "France", "fr", "#21304d", "#ffffff"),
  national("germany", "Germany", "de", "#ffffff", "#0b0f10"),
  national("italy", "Italy", "it", "#0064aa", "#ffffff"),
  national("spain", "Spain", "es", "#aa151b", "#f1bf00"),
  national("netherlands", "Netherlands", "nl", "#ff6600", "#21468b"),
  national("portugal", "Portugal", "pt", "#a4161a", "#046a38"),

  // Argentine Primera División clubs (teams only — kit history added later)
  club("river-plate", "River Plate", "#ffffff", "#e2001a", "River"),
  club("racing-club", "Racing Club", "#75aadb", "#ffffff", "Racing"),
  club("independiente", "Independiente", "#e2001a", "#ffffff"),
  club("san-lorenzo", "San Lorenzo", "#173f7a", "#a01441"),
  club("velez-sarsfield", "Vélez Sarsfield", "#ffffff", "#173f7a", "Vélez"),
  club(
    "estudiantes-lp",
    "Estudiantes de La Plata",
    "#e2001a",
    "#ffffff",
    "Estudiantes",
  ),
  club("newells", "Newell's Old Boys", "#e2001a", "#0b0f10", "Newell's"),
  club("rosario-central", "Rosario Central", "#173f7a", "#f6b40e", "Central"),
  club("huracan", "Huracán", "#ffffff", "#e2001a"),
  club("gimnasia-lp", "Gimnasia de La Plata", "#ffffff", "#173f7a", "Gimnasia"),
  club("lanus", "Lanús", "#7d2248", "#ffffff"),
  club("banfield", "Banfield", "#00734d", "#ffffff"),
  club(
    "argentinos-juniors",
    "Argentinos Juniors",
    "#e2001a",
    "#ffffff",
    "Argentinos",
  ),
  club("talleres", "Talleres de Córdoba", "#173f7a", "#ffffff", "Talleres"),
  club("belgrano", "Belgrano", "#55b5e5", "#0b0f10"),
  club("godoy-cruz", "Godoy Cruz", "#173f7a", "#ffffff"),
  club("union", "Unión de Santa Fe", "#e2001a", "#ffffff", "Unión"),
  club("colon", "Colón de Santa Fe", "#e2001a", "#0b0f10", "Colón"),
  club(
    "defensa-y-justicia",
    "Defensa y Justicia",
    "#00734d",
    "#f6b40e",
    "Defensa",
  ),
  club("tigre", "Tigre", "#173f7a", "#e2001a"),
];

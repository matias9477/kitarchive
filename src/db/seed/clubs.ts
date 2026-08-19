import { LATEST_SEASON_START } from "./season";
import type { EraSeed, KitSeed, TeamSeed } from "./types";

/**
 * Club catalogue beyond the primary Boca collection: the big five European
 * leagues, the Americas leagues the collector cares about, and a curated set
 * of continental giants. Team IDs are the crest-library slugs where a crest
 * exists (config/teamLogos.ts). Seasons are generated 2014 → present with
 * home/away kits and no manufacturer (best-effort; correct in-app). Colors
 * are best-effort for the notable sides.
 *
 * Season style: European leagues run cross-year ("2014/15"); South American,
 * MLS and J-League seasons are calendar-year ("2014").
 */

type SeasonStyle = "cross" | "calendar";

interface ClubRow {
  id: string;
  name: string;
  shortName?: string;
  colors?: [primary: string, secondary?: string];
}

interface LeagueDef {
  countryId: string;
  style: SeasonStyle;
  clubs: ClubRow[];
}

const c = (
  id: string,
  name: string,
  colors?: [string, string?],
  shortName?: string,
): ClubRow => ({
  id,
  name,
  ...(colors ? { colors } : {}),
  ...(shortName ? { shortName } : {}),
});

const LEAGUES: LeagueDef[] = [
  // ── England: Premier League ─────────────────────────────────────────────
  {
    countryId: "en",
    style: "cross",
    clubs: [
      c("arsenal", "Arsenal", ["#e2001a", "#ffffff"]),
      c("aston-villa", "Aston Villa", ["#7d2248", "#55b5e5"]),
      c("bournemouth", "Bournemouth", ["#e2001a", "#0b0f10"]),
      c("brentford", "Brentford", ["#e2001a", "#ffffff"]),
      c("brighton", "Brighton", ["#0072c6", "#ffffff"]),
      c("chelsea", "Chelsea", ["#173f7a", "#ffffff"]),
      c("coventry-city", "Coventry City", ["#55b5e5", "#ffffff"]),
      c("crystal-palace", "Crystal Palace", ["#173f7a", "#e2001a"]),
      c("everton", "Everton", ["#173f7a", "#ffffff"]),
      c("fulham", "Fulham", ["#ffffff", "#0b0f10"]),
      c("hull-city", "Hull City", ["#f6b40e", "#0b0f10"]),
      c("ipswich", "Ipswich Town", ["#173f7a", "#ffffff"]),
      c("leeds-united", "Leeds United", ["#ffffff", "#f6b40e"]),
      c("liverpool", "Liverpool", ["#e2001a", "#ffffff"]),
      c(
        "manchester-city",
        "Manchester City",
        ["#55b5e5", "#ffffff"],
        "Man City",
      ),
      c(
        "manchester-united",
        "Manchester United",
        ["#e2001a", "#0b0f10"],
        "Man Utd",
      ),
      c("newcastle", "Newcastle United", ["#0b0f10", "#ffffff"]),
      c("nottingham-forest", "Nottingham Forest", ["#e2001a", "#ffffff"]),
      c("sunderland", "Sunderland", ["#e2001a", "#ffffff"]),
      c("tottenham", "Tottenham Hotspur", ["#ffffff", "#173f7a"], "Spurs"),
    ],
  },
  // ── Spain: La Liga ──────────────────────────────────────────────────────
  {
    countryId: "es",
    style: "cross",
    clubs: [
      c("athletic-club", "Athletic Club", ["#e2001a", "#ffffff"]),
      c("atletico-madrid", "Atlético Madrid", ["#e2001a", "#ffffff"], "Atleti"),
      c("barcelona", "Barcelona", ["#a4161a", "#173f7a"], "Barça"),
      c("celta", "Celta de Vigo", ["#55b5e5", "#ffffff"]),
      c("deportivo", "Deportivo Alavés", ["#0072c6", "#ffffff"], "Alavés"),
      c(
        "deportivo-la-coruna",
        "Deportivo La Coruña",
        ["#0072c6", "#ffffff"],
        "Depor",
      ),
      c("elche", "Elche", ["#00734d", "#ffffff"]),
      c("espanyol", "Espanyol", ["#0072c6", "#ffffff"]),
      c("getafe", "Getafe", ["#0072c6", "#ffffff"]),
      c("levante", "Levante", ["#173f7a", "#a4161a"]),
      c("malaga", "Málaga", ["#0072c6", "#ffffff"]),
      c("osasuna", "Osasuna", ["#e2001a", "#173f7a"]),
      c("racing", "Racing de Santander", ["#ffffff", "#00734d"]),
      c("rayo-vallecano", "Rayo Vallecano", ["#ffffff", "#e2001a"], "Rayo"),
      c("real-betis", "Real Betis", ["#00734d", "#ffffff"], "Betis"),
      c("real-madrid", "Real Madrid", ["#ffffff", "#f6b40e"]),
      c("real-sociedad", "Real Sociedad", ["#0072c6", "#ffffff"], "La Real"),
      c("sevilla", "Sevilla", ["#ffffff", "#e2001a"]),
      c("valencia", "Valencia", ["#ffffff", "#ff6600"]),
      c("villarreal", "Villarreal", ["#f6b40e", "#173f7a"]),
    ],
  },
  // ── Italy: Serie A ──────────────────────────────────────────────────────
  {
    countryId: "it",
    style: "cross",
    clubs: [
      c("atalanta", "Atalanta", ["#173f7a", "#0b0f10"]),
      c("bologna", "Bologna", ["#a4161a", "#173f7a"]),
      c("cagliari", "Cagliari", ["#a4161a", "#173f7a"]),
      c("como-1907", "Como 1907", ["#173f7a", "#ffffff"], "Como"),
      c("fiorentina", "Fiorentina", ["#5b3e96", "#ffffff"]),
      c("frosinone", "Frosinone", ["#f6b40e", "#173f7a"]),
      c("genoa", "Genoa", ["#a4161a", "#173f7a"]),
      c("inter", "Inter", ["#173f7a", "#0b0f10"]),
      c("juventus", "Juventus", ["#ffffff", "#0b0f10"], "Juve"),
      c("lazio", "Lazio", ["#55b5e5", "#ffffff"]),
      c("lecce", "Lecce", ["#f6b40e", "#a4161a"]),
      c("milan", "AC Milan", ["#e2001a", "#0b0f10"], "Milan"),
      c("monza", "Monza", ["#e2001a", "#ffffff"]),
      c("napoli", "Napoli", ["#0072c6", "#ffffff"]),
      c("parma", "Parma", ["#f6b40e", "#173f7a"]),
      c("roma", "Roma", ["#a4161a", "#f6b40e"]),
      c("sassuolo", "Sassuolo", ["#00734d", "#0b0f10"]),
      c("torino", "Torino", ["#7d2248", "#ffffff"], "Toro"),
      c("udinese", "Udinese", ["#0b0f10", "#ffffff"]),
      c("venezia", "Venezia", ["#0b0f10", "#ff6600"]),
    ],
  },
  // ── Germany: Bundesliga ─────────────────────────────────────────────────
  {
    countryId: "de",
    style: "cross",
    clubs: [
      c("augsburg", "FC Augsburg", ["#e2001a", "#00734d"]),
      c("bayer-leverkusen", "Bayer Leverkusen", ["#e2001a", "#0b0f10"]),
      c("bayern-munchen", "Bayern Munich", ["#e2001a", "#ffffff"], "Bayern"),
      c(
        "borussia-dortmund",
        "Borussia Dortmund",
        ["#f6b40e", "#0b0f10"],
        "BVB",
      ),
      c(
        "borussia-monchengladbach",
        "Borussia Mönchengladbach",
        ["#ffffff", "#00734d"],
        "Gladbach",
      ),
      c("eintracht-frankfurt", "Eintracht Frankfurt", ["#e2001a", "#0b0f10"]),
      c("freiburg", "SC Freiburg", ["#e2001a", "#0b0f10"]),
      c("hamburger-sv", "Hamburger SV", ["#ffffff", "#e2001a"], "HSV"),
      c("hoffenheim", "Hoffenheim", ["#0072c6", "#ffffff"]),
      c("koln", "1. FC Köln", ["#ffffff", "#e2001a"], "Köln"),
      c("mainz-05", "Mainz 05", ["#e2001a", "#ffffff"]),
      c("paderborn", "SC Paderborn", ["#0072c6", "#0b0f10"]),
      c("rb-leipzig", "RB Leipzig", ["#ffffff", "#e2001a"]),
      c("schalke-04", "Schalke 04", ["#0072c6", "#ffffff"], "Schalke"),
      c("sv-elversberg", "SV Elversberg", ["#ffffff", "#0072c6"]),
      c("union-berlin", "Union Berlin", ["#e2001a", "#f6b40e"]),
      c("vfb-stuttgart", "VfB Stuttgart", ["#ffffff", "#e2001a"], "Stuttgart"),
      c("werder-bremen", "Werder Bremen", ["#00734d", "#ffffff"], "Werder"),
    ],
  },
  // ── France: Ligue 1 ─────────────────────────────────────────────────────
  {
    countryId: "fr",
    style: "cross",
    clubs: [
      c("angers", "Angers SCO", ["#0b0f10", "#ffffff"]),
      c("as-monaco", "AS Monaco", ["#e2001a", "#ffffff"], "Monaco"),
      c("auxerre", "AJ Auxerre", ["#ffffff", "#173f7a"]),
      c("brest", "Stade Brestois", ["#e2001a", "#ffffff"], "Brest"),
      c("le-havre-ac", "Le Havre AC", ["#55b5e5", "#173f7a"], "Le Havre"),
      c("le-mans", "Le Mans FC", ["#e2001a", "#f6b40e"]),
      c("lille", "Lille OSC", ["#e2001a", "#173f7a"], "LOSC"),
      c("lorient", "FC Lorient", ["#ff6600", "#0b0f10"]),
      c("lyon", "Olympique Lyonnais", ["#ffffff", "#e2001a"], "Lyon"),
      c("marseille", "Olympique de Marseille", ["#ffffff", "#55b5e5"], "OM"),
      c("nice", "OGC Nice", ["#e2001a", "#0b0f10"]),
      c("paris-fc", "Paris FC", ["#173f7a", "#ffffff"]),
      c(
        "paris-saint-germain",
        "Paris Saint-Germain",
        ["#173f7a", "#e2001a"],
        "PSG",
      ),
      c("rc-lens", "RC Lens", ["#f6b40e", "#e2001a"], "Lens"),
      c(
        "rc-strasbourg-alsace",
        "RC Strasbourg",
        ["#0072c6", "#ffffff"],
        "Strasbourg",
      ),
      c("rennes", "Stade Rennais", ["#e2001a", "#0b0f10"], "Rennes"),
      c("toulouse", "Toulouse FC", ["#5b3e96", "#ffffff"]),
      c("troyes", "ESTAC Troyes", ["#0072c6", "#ffffff"], "Troyes"),
    ],
  },
  // ── Brazil: Série A ─────────────────────────────────────────────────────
  {
    countryId: "br",
    style: "calendar",
    clubs: [
      c("athletico-paranaense", "Athletico Paranaense", ["#e2001a", "#0b0f10"]),
      c("atletico-mineiro", "Atlético Mineiro", ["#0b0f10", "#ffffff"], "Galo"),
      c("bahia", "Bahia", ["#0072c6", "#e2001a"]),
      c("botafogo", "Botafogo", ["#0b0f10", "#ffffff"]),
      c("chapecoense", "Chapecoense", ["#00734d", "#ffffff"], "Chape"),
      c("clube-do-remo", "Clube do Remo", ["#173f7a", "#ffffff"], "Remo"),
      c("corinthians", "Corinthians", ["#ffffff", "#0b0f10"]),
      c("coritiba", "Coritiba", ["#00734d", "#ffffff"]),
      c("cruzeiro", "Cruzeiro", ["#0072c6", "#ffffff"]),
      c("flamengo", "Flamengo", ["#e2001a", "#0b0f10"], "Fla"),
      c("fluminense", "Fluminense", ["#7d2248", "#00734d"], "Flu"),
      c("gremio", "Grêmio", ["#55b5e5", "#0b0f10"]),
      c("internacional", "Internacional", ["#e2001a", "#ffffff"], "Inter"),
      c("mirassol", "Mirassol", ["#f6b40e", "#00734d"]),
      c("palmeiras", "Palmeiras", ["#00734d", "#ffffff"]),
      c("rb-bragantino", "RB Bragantino", ["#ffffff", "#e2001a"]),
      c("santos", "Santos", ["#ffffff", "#0b0f10"]),
      c("sao-paulo", "São Paulo", ["#ffffff", "#e2001a"], "SPFC"),
      c("vasco-da-gama", "Vasco da Gama", ["#0b0f10", "#ffffff"], "Vasco"),
      c("vitoria", "Vitória", ["#e2001a", "#0b0f10"]),
    ],
  },
  // ── USA/Canada: MLS ─────────────────────────────────────────────────────
  {
    countryId: "us",
    style: "calendar",
    clubs: [
      c("atlanta-united", "Atlanta United", ["#7d2248", "#f6b40e"]),
      c("austins-fc", "Austin FC", ["#00734d", "#0b0f10"]),
      c("charlotte-fc", "Charlotte FC", ["#55b5e5", "#173f7a"]),
      c("chicago-fire-fc", "Chicago Fire", ["#e2001a", "#173f7a"]),
      c("colorado-rapids", "Colorado Rapids", ["#7d2248", "#55b5e5"]),
      c("columbus-crew", "Columbus Crew", ["#f6b40e", "#0b0f10"]),
      c("dc-united", "DC United", ["#0b0f10", "#e2001a"]),
      c("fc-cincinnati", "FC Cincinnati", ["#ff6600", "#173f7a"]),
      c("fc-dallas", "FC Dallas", ["#e2001a", "#173f7a"]),
      c("houston-dynamo", "Houston Dynamo", ["#ff6600", "#0b0f10"]),
      c("inter-miami-cf", "Inter Miami", ["#f5b6cd", "#0b0f10"]),
      c("la-galaxy", "LA Galaxy", ["#ffffff", "#173f7a"]),
      c("los-angeles-fc", "LAFC", ["#0b0f10", "#f6b40e"]),
      c("minnesota-united-fc", "Minnesota United", ["#55b5e5", "#0b0f10"]),
      c("nashville-sc", "Nashville SC", ["#f6b40e", "#173f7a"]),
      c("new-england-revolution", "New England Revolution", [
        "#173f7a",
        "#e2001a",
      ]),
      c(
        "new-york-city-fc",
        "New York City FC",
        ["#55b5e5", "#173f7a"],
        "NYCFC",
      ),
      c("new-york-red-bulls", "New York Red Bulls", ["#ffffff", "#e2001a"]),
      c("orlando-city", "Orlando City", ["#5b3e96", "#f6b40e"]),
      c("philadelphia-union", "Philadelphia Union", ["#173f7a", "#f6b40e"]),
      c("portland-timbers", "Portland Timbers", ["#00734d", "#f6b40e"]),
      c("real-salt-lake", "Real Salt Lake", ["#a4161a", "#173f7a"]),
      c("san-diego-fc", "San Diego FC", ["#55b5e5", "#f5b6cd"]),
      c("san-jose-earthquakes", "San Jose Earthquakes", ["#0072c6", "#0b0f10"]),
      c("seattle-sounders-fc", "Seattle Sounders", ["#00734d", "#173f7a"]),
      c("sporting-kansas-city", "Sporting Kansas City", ["#55b5e5", "#173f7a"]),
      c("st-louis-city-sc", "St. Louis City SC", ["#e2001a", "#f6b40e"]),
    ],
  },
  {
    countryId: "ca",
    style: "calendar",
    clubs: [
      c("cf-montreal", "CF Montréal", ["#173f7a", "#0b0f10"]),
      c("toronto-fc", "Toronto FC", ["#e2001a", "#ffffff"]),
      c("vancouver-whitecaps-fc", "Vancouver Whitecaps", [
        "#ffffff",
        "#173f7a",
      ]),
    ],
  },
  // ── Uruguay: Primera División ───────────────────────────────────────────
  {
    countryId: "uy",
    style: "calendar",
    clubs: [
      c("albion", "Albion FC", ["#0072c6", "#ffffff"]),
      c("boston-river", "Boston River", ["#00734d", "#e2001a"]),
      c("central-espanol", "Central Español", ["#a4161a", "#ffffff"]),
      c("cerro", "Cerro", ["#55b5e5", "#ffffff"]),
      c("cerro-largo", "Cerro Largo", ["#173f7a", "#ffffff"]),
      c("danubio", "Danubio", ["#ffffff", "#0b0f10"]),
      c("defensor-sporting", "Defensor Sporting", ["#5b3e96", "#ffffff"]),
      c("deportivo-maldonado", "Deportivo Maldonado", ["#00734d", "#e2001a"]),
      c("juventud", "Juventud de Las Piedras", ["#a4161a", "#ffffff"]),
      c("liverpool-montevideo", "Liverpool de Montevideo", [
        "#0b0f10",
        "#55b5e5",
      ]),
      c(
        "montevideo-city-torque",
        "Montevideo City Torque",
        ["#55b5e5", "#173f7a"],
        "Torque",
      ),
      c(
        "montevideo-wanderers",
        "Montevideo Wanderers",
        ["#ffffff", "#0b0f10"],
        "Wanderers",
      ),
      c("nacional", "Nacional", ["#ffffff", "#0072c6"]),
      c("penarol", "Peñarol", ["#f6b40e", "#0b0f10"]),
      c("progreso", "Progreso", ["#f6b40e", "#e2001a"]),
      c("racing-montevideo", "Racing de Montevideo", ["#ffffff", "#00734d"]),
    ],
  },
  // ── Chile: Liga de Primera ──────────────────────────────────────────────
  {
    countryId: "cl",
    style: "calendar",
    clubs: [
      c("audax-italiano", "Audax Italiano", ["#00734d", "#ffffff"]),
      c("cobresal", "Cobresal", ["#ff6600", "#ffffff"]),
      c("colo-colo", "Colo-Colo", ["#ffffff", "#0b0f10"]),
      c("coquimbo-unido", "Coquimbo Unido", ["#f6b40e", "#0b0f10"]),
      c("deportes-concepcion", "Deportes Concepción", ["#5b3e96", "#ffffff"]),
      c("deportes-limache", "Deportes Limache", ["#e2001a", "#0b0f10"]),
      c("everton-vina", "Everton de Viña del Mar", ["#173f7a", "#f6b40e"]),
      c("huachipato", "Huachipato", ["#173f7a", "#0b0f10"]),
      c("la-serena", "Deportes La Serena", ["#7d2248", "#ffffff"]),
      c("nublense", "Ñublense", ["#e2001a", "#ffffff"]),
      c("ohiggins", "O'Higgins", ["#55b5e5", "#0b0f10"]),
      c("palestino", "Palestino", ["#ffffff", "#00734d"]),
      c("union-la-calera", "Unión La Calera", ["#e2001a", "#0b0f10"]),
      c(
        "universidad-catolica",
        "Universidad Católica",
        ["#ffffff", "#173f7a"],
        "La UC",
      ),
      c(
        "universidad-de-chile",
        "Universidad de Chile",
        ["#173f7a", "#e2001a"],
        "La U",
      ),
      c("universidad-de-concepcion", "Universidad de Concepción", [
        "#f6b40e",
        "#173f7a",
      ]),
    ],
  },
  // ── Argentina: rest of the Primera + iconic classics ────────────────────
  {
    countryId: "ar",
    style: "calendar",
    clubs: [
      c("aldosivi", "Aldosivi", ["#f6b40e", "#00734d"]),
      c("atletico-tucuman", "Atlético Tucumán", ["#55b5e5", "#ffffff"]),
      c("barracas-central", "Barracas Central", ["#e2001a", "#ffffff"]),
      c("central-cordoba", "Central Córdoba (SdE)", ["#0b0f10", "#ffffff"]),
      c("club-atletico-platanense", "Platense", ["#ffffff", "#7d2248"]),
      c("deportivo-riestra", "Deportivo Riestra", ["#0b0f10", "#ffffff"]),
      c("estudiantes-de-rio-cuarto", "Estudiantes de Río Cuarto", [
        "#55b5e5",
        "#ffffff",
      ]),
      c("gimnasia-y-esgrima", "Gimnasia y Esgrima (Mendoza)", [
        "#ffffff",
        "#0b0f10",
      ]),
      c("independiente-rivadavia", "Independiente Rivadavia", [
        "#173f7a",
        "#ffffff",
      ]),
      c("instituto-cordoba", "Instituto de Córdoba", ["#e2001a", "#ffffff"]),
      c("sarmiento", "Sarmiento de Junín", ["#00734d", "#ffffff"]),
      // Iconic clubs outside the current Primera
      c("all-boys", "All Boys", ["#ffffff", "#0b0f10"]),
      c("arsenal-de-sarandi", "Arsenal de Sarandí", ["#55b5e5", "#e2001a"]),
      c("atletico-atlanta", "Atlanta", ["#173f7a", "#f6b40e"]),
      c("chacarita-juniors", "Chacarita Juniors", ["#0b0f10", "#e2001a"]),
      c("deportivo-moron", "Deportivo Morón", ["#e2001a", "#ffffff"]),
      c(
        "ferro-carril-oeste",
        "Ferro Carril Oeste",
        ["#00734d", "#ffffff"],
        "Ferro",
      ),
      c("nueva-chicago", "Nueva Chicago", ["#00734d", "#0b0f10"]),
      c("quilmes", "Quilmes", ["#ffffff", "#173f7a"]),
      c("temperley", "Temperley", ["#55b5e5", "#ffffff"]),
    ],
  },
  // ── Continental giants ──────────────────────────────────────────────────
  {
    countryId: "mx",
    style: "calendar",
    clubs: [
      c("club-america", "Club América", ["#f6b40e", "#173f7a"], "América"),
      c(
        "cd-guadalajara",
        "Chivas de Guadalajara",
        ["#e2001a", "#ffffff"],
        "Chivas",
      ),
      c("cruz-azul", "Cruz Azul", ["#0072c6", "#ffffff"]),
      c("monterrey", "Monterrey", ["#173f7a", "#ffffff"], "Rayados"),
      c("tigres-uanl", "Tigres UANL", ["#f6b40e", "#173f7a"], "Tigres"),
      c("unam-pumas", "Pumas UNAM", ["#173f7a", "#f6b40e"], "Pumas"),
    ],
  },
  {
    countryId: "pt",
    style: "cross",
    clubs: [
      c("benfica", "Benfica", ["#e2001a", "#ffffff"]),
      c("fc-porto", "FC Porto", ["#0072c6", "#ffffff"], "Porto"),
      c("sporting-cp", "Sporting CP", ["#00734d", "#ffffff"], "Sporting"),
    ],
  },
  {
    countryId: "nl",
    style: "cross",
    clubs: [
      c("ajax", "Ajax", ["#ffffff", "#e2001a"]),
      c("feyenoord", "Feyenoord", ["#e2001a", "#ffffff"]),
      c("psv", "PSV Eindhoven", ["#e2001a", "#ffffff"], "PSV"),
    ],
  },
  {
    countryId: "sct",
    style: "cross",
    clubs: [
      c("celtic", "Celtic", ["#00734d", "#ffffff"]),
      c("rangers", "Rangers", ["#173f7a", "#ffffff"]),
    ],
  },
  {
    countryId: "tr",
    style: "cross",
    clubs: [
      c("besiktas", "Beşiktaş", ["#0b0f10", "#ffffff"]),
      c("fenerbahce", "Fenerbahçe", ["#f6b40e", "#173f7a"], "Fener"),
      c("galatasaray", "Galatasaray", ["#f6b40e", "#a4161a"], "Gala"),
    ],
  },
  {
    countryId: "gr",
    style: "cross",
    clubs: [
      c("aek-athens", "AEK Athens", ["#f6b40e", "#0b0f10"], "AEK"),
      c("olympiacos", "Olympiacos", ["#e2001a", "#ffffff"]),
      c("panathinaikos", "Panathinaikos", ["#00734d", "#ffffff"], "Pana"),
    ],
  },
  {
    countryId: "eg",
    style: "cross",
    clubs: [
      c("al-ahly", "Al Ahly", ["#e2001a", "#ffffff"]),
      c("zamalek", "Zamalek", ["#ffffff", "#e2001a"]),
    ],
  },
  {
    countryId: "za",
    style: "cross",
    clubs: [
      c("kaizer-chiefs", "Kaizer Chiefs", ["#f6b40e", "#0b0f10"]),
      c(
        "mamelodi-sundowns",
        "Mamelodi Sundowns",
        ["#f6b40e", "#00734d"],
        "Sundowns",
      ),
      c(
        "orlando-pirates",
        "Orlando Pirates",
        ["#0b0f10", "#ffffff"],
        "Pirates",
      ),
    ],
  },
  {
    countryId: "ma",
    style: "cross",
    clubs: [
      c("raja-ca", "Raja Casablanca", ["#00734d", "#ffffff"], "Raja"),
      c("wydad-ac", "Wydad Casablanca", ["#e2001a", "#ffffff"], "Wydad"),
    ],
  },
  {
    countryId: "sa",
    style: "cross",
    clubs: [
      c("al-ahli", "Al Ahli", ["#00734d", "#ffffff"]),
      c("al-hilal", "Al Hilal", ["#0072c6", "#ffffff"]),
      c("al-ittihad", "Al Ittihad", ["#f6b40e", "#0b0f10"]),
      c("al-nassr", "Al Nassr", ["#f6b40e", "#173f7a"]),
    ],
  },
  {
    countryId: "jp",
    style: "calendar",
    clubs: [
      c("kashima-antlers", "Kashima Antlers", ["#7d2248", "#0b0f10"]),
      c("urawa-reds", "Urawa Red Diamonds", ["#e2001a", "#0b0f10"], "Urawa"),
      c("vissel-kobe", "Vissel Kobe", ["#7d2248", "#ffffff"]),
      c(
        "yokohama-f-marinos",
        "Yokohama F. Marinos",
        ["#173f7a", "#e2001a"],
        "Marinos",
      ),
    ],
  },
  {
    countryId: "co",
    style: "calendar",
    clubs: [
      c("america-de-cali", "América de Cali", ["#e2001a", "#ffffff"]),
      c(
        "atletico-junior",
        "Junior de Barranquilla",
        ["#e2001a", "#ffffff"],
        "Junior",
      ),
      c("atletico-nacional", "Atlético Nacional", ["#00734d", "#ffffff"]),
      c("deportivo-cali", "Deportivo Cali", ["#00734d", "#ffffff"]),
      c("millonarios", "Millonarios", ["#0072c6", "#ffffff"]),
    ],
  },
  {
    countryId: "ec",
    style: "calendar",
    clubs: [
      c("barcelona-sc", "Barcelona SC", ["#f6b40e", "#0b0f10"]),
      c("emelec", "Emelec", ["#0072c6", "#ffffff"]),
      c("liga-de-quito", "LDU de Quito", ["#ffffff", "#e2001a"], "LDU"),
    ],
  },
  {
    countryId: "pe",
    style: "calendar",
    clubs: [
      c("alianza-lima", "Alianza Lima", ["#173f7a", "#ffffff"]),
      c("sporting-cristal", "Sporting Cristal", ["#55b5e5", "#ffffff"]),
      c("universitario", "Universitario", ["#ffffff", "#7d2248"], "La U"),
    ],
  },
  {
    countryId: "py",
    style: "calendar",
    clubs: [
      c("cerro-porteno", "Cerro Porteño", ["#e2001a", "#173f7a"]),
      c("libertad", "Libertad", ["#0b0f10", "#ffffff"]),
      c("olimpia", "Olimpia", ["#ffffff", "#0b0f10"]),
    ],
  },
  {
    countryId: "bo",
    style: "calendar",
    clubs: [
      c("bolivar", "Bolívar", ["#55b5e5", "#ffffff"]),
      c("the-strongest", "The Strongest", ["#f6b40e", "#0b0f10"]),
    ],
  },
];

/**
 * Clubs seeded by core.ts whose season eras/kits are generated here too
 * (their team rows already shipped; Boca has its own curated history).
 */
const CORE_AR_CLUB_IDS = [
  "river-plate",
  "racing-club",
  "independiente",
  "san-lorenzo",
  "velez-sarsfield",
  "estudiantes-lp",
  "newells",
  "rosario-central",
  "huracan",
  "gimnasia-lp",
  "lanus",
  "banfield",
  "argentinos-juniors",
  "talleres",
  "belgrano",
  "godoy-cruz",
  "union",
  "colon",
  "defensa-y-justicia",
  "tigre",
];

const FIRST_SEASON = 2014;
const SEASON_STARTS = Array.from(
  { length: LATEST_SEASON_START - FIRST_SEASON + 1 },
  (_, i) => FIRST_SEASON + i,
);

const crossLabel = (start: number) =>
  `${start}/${String((start + 1) % 100).padStart(2, "0")}`;

const eraId = (teamId: string, start: number, style: SeasonStyle) =>
  style === "cross"
    ? `${teamId}-${start}-${String((start + 1) % 100).padStart(2, "0")}`
    : `${teamId}-${start}`;

const erasFor = (teamId: string, style: SeasonStyle): EraSeed[] =>
  SEASON_STARTS.map((start) => ({
    id: eraId(teamId, start, style),
    teamId,
    startYear: start,
    endYear: style === "cross" ? start + 1 : start,
    label: style === "cross" ? crossLabel(start) : String(start),
    source: "seed",
  }));

const kitsFor = (teamId: string, style: SeasonStyle): KitSeed[] =>
  SEASON_STARTS.flatMap((start) =>
    (["home", "away"] as const).map((type) => ({
      id: `${eraId(teamId, start, style)}-${type}`,
      teamId,
      eraId: eraId(teamId, start, style),
      type,
      source: "seed" as const,
    })),
  );

export const clubTeamSeeds: TeamSeed[] = LEAGUES.flatMap((league) =>
  league.clubs.map((row) => ({
    id: row.id,
    name: row.name,
    countryId: league.countryId,
    type: "club" as const,
    ...(row.shortName ? { shortName: row.shortName } : {}),
    ...(row.colors
      ? {
          primaryColor: row.colors[0],
          ...(row.colors[1] ? { secondaryColor: row.colors[1] } : {}),
        }
      : {}),
    source: "seed" as const,
  })),
);

const allGenerated: { teamId: string; style: SeasonStyle }[] = [
  ...LEAGUES.flatMap((league) =>
    league.clubs.map((row) => ({ teamId: row.id, style: league.style })),
  ),
  ...CORE_AR_CLUB_IDS.map((teamId) => ({
    teamId,
    style: "calendar" as const,
  })),
];

export const clubEraSeeds: EraSeed[] = allGenerated.flatMap(
  ({ teamId, style }) => erasFor(teamId, style),
);

export const clubKitSeeds: KitSeed[] = allGenerated.flatMap(
  ({ teamId, style }) => kitsFor(teamId, style),
);

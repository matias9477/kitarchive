import type { CountrySeed, TeamSeed } from "./types";

/**
 * The world's national teams — every side on our crest source that plays
 * sanctioned internationals (FIFA members plus CONCACAF/CAF/OFC associate
 * territories). IDs are the crest-library slugs (config/teamLogos.ts), so
 * every row resolves its crest automatically. Colors and manufacturers are
 * best-effort for the notable sides; the rest fall back to defaults and get
 * corrected in-app. The ten nations already shipped in core.ts appear here
 * too (for cycles + grouping) but are excluded from the exported team rows.
 */

export type Confederation =
  "uefa" | "conmebol" | "concacaf" | "caf" | "afc" | "ofc";

export interface NationRow {
  id: string;
  name: string;
  countryId: string;
  confederation: Confederation;
  colors?: [primary: string, secondary?: string];
  /** Manufacturer id, flat or per cycle start year (2014+ cycles). */
  manufacturer?: string | ((start: number) => string);
}

const n = (
  id: string,
  name: string,
  countryId: string,
  confederation: Confederation,
  colors?: [string, string?],
  manufacturer?: string | ((start: number) => string),
): NationRow => ({
  id,
  name,
  countryId,
  confederation,
  ...(colors ? { colors } : {}),
  ...(manufacturer ? { manufacturer } : {}),
});

export const NATION_ROWS: NationRow[] = [
  // ── UEFA ────────────────────────────────────────────────────────────────
  n("albania", "Albania", "al", "uefa", ["#e2001a", "#0b0f10"], "macron"),
  n("andorra", "Andorra", "ad", "uefa"),
  n("armenia", "Armenia", "am", "uefa"),
  n("austria", "Austria", "at", "uefa", ["#e2001a", "#ffffff"], "puma"),
  n("azerbaijan", "Azerbaijan", "az", "uefa"),
  n("belarus", "Belarus", "by", "uefa"),
  n("belgium", "Belgium", "be", "uefa", ["#e30613", "#0b0f10"], "adidas"),
  n("bosnia-and-herzegovina", "Bosnia and Herzegovina", "ba", "uefa", [
    "#173f7a",
    "#f6b40e",
  ]),
  n("bulgaria", "Bulgaria", "bg", "uefa", ["#ffffff", "#00734d"]),
  n("croatia", "Croatia", "hr", "uefa", ["#ffffff", "#e2001a"], "nike"),
  n("cyprus", "Cyprus", "cy", "uefa"),
  n(
    "czech-republic",
    "Czech Republic",
    "cz",
    "uefa",
    ["#e2001a", "#ffffff"],
    "puma",
  ),
  n("denmark", "Denmark", "dk", "uefa", ["#c8102e", "#ffffff"], "hummel"),
  n("england", "England", "en", "uefa", ["#ffffff", "#001d48"], "nike"),
  n("estonia", "Estonia", "ee", "uefa"),
  n("faroe-islands", "Faroe Islands", "fo", "uefa"),
  n("finland", "Finland", "fi", "uefa", ["#ffffff", "#0072c6"], "nike"),
  n("france", "France", "fr", "uefa", ["#21304d", "#ffffff"], "nike"),
  n("georgia", "Georgia", "ge", "uefa", ["#ffffff", "#e2001a"]),
  n("germany", "Germany", "de", "uefa", ["#ffffff", "#0b0f10"], "adidas"),
  n("gibraltar", "Gibraltar", "gi", "uefa"),
  n("greece", "Greece", "gr", "uefa", ["#ffffff", "#0072c6"], "nike"),
  n("hungary", "Hungary", "hu", "uefa", ["#e2001a", "#00734d"], "adidas"),
  n("iceland", "Iceland", "is", "uefa", ["#0072c6", "#ffffff"], "puma"),
  n("israel", "Israel", "il", "uefa", ["#0072c6", "#ffffff"]),
  n("italy", "Italy", "it", "uefa", ["#0064aa", "#ffffff"], (s) =>
    s >= 2023 ? "adidas" : "puma",
  ),
  n("kazakhstan", "Kazakhstan", "kz", "uefa", ["#55b5e5", "#f6b40e"]),
  n("kosovo", "Kosovo", "xk", "uefa", ["#173f7a", "#f6b40e"]),
  n("latvia", "Latvia", "lv", "uefa"),
  n("liechtenstein", "Liechtenstein", "li", "uefa"),
  n("lithuania", "Lithuania", "lt", "uefa"),
  n("luxembourg", "Luxembourg", "lu", "uefa"),
  n("malta", "Malta", "mt", "uefa"),
  n("moldova", "Moldova", "md", "uefa"),
  n("montenegro", "Montenegro", "me", "uefa"),
  n("netherlands", "Netherlands", "nl", "uefa", ["#ff6600", "#21468b"], "nike"),
  n("north-macedonia", "North Macedonia", "mk", "uefa", ["#e2001a", "#f6b40e"]),
  n(
    "northern-ireland",
    "Northern Ireland",
    "nir",
    "uefa",
    ["#00734d", "#ffffff"],
    "adidas",
  ),
  n("norway", "Norway", "no", "uefa", ["#e2001a", "#ffffff"], "nike"),
  n("poland", "Poland", "pl", "uefa", ["#ffffff", "#e2001a"], "nike"),
  n("portugal", "Portugal", "pt", "uefa", ["#a4161a", "#046a38"], "nike"),
  n("republic-of-ireland", "Republic of Ireland", "ie", "uefa", [
    "#00734d",
    "#ffffff",
  ]),
  n("romania", "Romania", "ro", "uefa", ["#f6b40e", "#e2001a"], "joma"),
  n("russia", "Russia", "ru", "uefa", ["#e2001a", "#ffffff"], "adidas"),
  n("san-marino", "San Marino", "sm", "uefa"),
  n("scotland", "Scotland", "sct", "uefa", ["#173f7a", "#ffffff"], "adidas"),
  n("serbia", "Serbia", "rs", "uefa", ["#e2001a", "#ffffff"], "puma"),
  n("slovakia", "Slovakia", "sk", "uefa", ["#0072c6", "#ffffff"]),
  n("slovenia", "Slovenia", "si", "uefa", ["#ffffff", "#00734d"]),
  n("spain", "Spain", "es", "uefa", ["#aa151b", "#f1bf00"], "adidas"),
  n("sweden", "Sweden", "se", "uefa", ["#ffdf00", "#0072c6"], "adidas"),
  n("switzerland", "Switzerland", "ch", "uefa", ["#e2001a", "#ffffff"], "puma"),
  n("turkey", "Turkey", "tr", "uefa", ["#e2001a", "#ffffff"], "nike"),
  n("ukraine", "Ukraine", "ua", "uefa", ["#ffdf00", "#0072c6"], "joma"),
  n("wales", "Wales", "wal", "uefa", ["#e2001a", "#ffffff"], "adidas"),

  // ── CONMEBOL ────────────────────────────────────────────────────────────
  n(
    "argentina",
    "Argentina",
    "ar",
    "conmebol",
    ["#75aadb", "#ffffff"],
    "adidas",
  ),
  n("bolivia", "Bolivia", "bo", "conmebol", ["#00734d", "#ffffff"], "marathon"),
  n("brazil", "Brazil", "br", "conmebol", ["#ffdf00", "#009c3b"], "nike"),
  n("chile", "Chile", "cl", "conmebol", ["#e2001a", "#173f7a"]),
  n("colombia", "Colombia", "co", "conmebol", ["#ffdf00", "#173f7a"], "adidas"),
  n("ecuador", "Ecuador", "ec", "conmebol", ["#ffdf00", "#173f7a"], "marathon"),
  n("paraguay", "Paraguay", "py", "conmebol", ["#e2001a", "#ffffff"]),
  n("peru", "Peru", "pe", "conmebol", ["#ffffff", "#e2001a"]),
  n("uruguay", "Uruguay", "uy", "conmebol", ["#55b5e5", "#0b0f10"], (s) =>
    s >= 2024 ? "nike" : "puma",
  ),
  n("venezuela", "Venezuela", "ve", "conmebol", ["#7d2248", "#ffffff"]),

  // ── CONCACAF ────────────────────────────────────────────────────────────
  n("anguilla", "Anguilla", "ai", "concacaf"),
  n("antigua-and-barbuda", "Antigua and Barbuda", "ag", "concacaf"),
  n("aruba", "Aruba", "aw", "concacaf"),
  n("bahamas", "Bahamas", "bs", "concacaf"),
  n("barbados", "Barbados", "bb", "concacaf"),
  n("belize", "Belize", "bz", "concacaf"),
  n("bermuda", "Bermuda", "bm", "concacaf"),
  n("bonaire", "Bonaire", "bq", "concacaf"),
  n("british-virgin-islands", "British Virgin Islands", "vg", "concacaf"),
  n("canada", "Canada", "ca", "concacaf", ["#e2001a", "#ffffff"], "nike"),
  n("cayman-islands", "Cayman Islands", "ky", "concacaf"),
  n("costa-rica", "Costa Rica", "cr", "concacaf", ["#e2001a", "#173f7a"]),
  n("cuba", "Cuba", "cu", "concacaf"),
  n("curacao", "Curaçao", "cw", "concacaf"),
  n("dominica", "Dominica", "dm", "concacaf"),
  n("dominican-republic", "Dominican Republic", "do", "concacaf"),
  n("el-salvador", "El Salvador", "sv", "concacaf", ["#0072c6", "#ffffff"]),
  n("french-guiana", "French Guiana", "gf", "concacaf"),
  n("greenland", "Greenland", "gl", "concacaf"),
  n("grenada", "Grenada", "gd", "concacaf"),
  n("guadeloupe", "Guadeloupe", "gp", "concacaf"),
  n("guatemala", "Guatemala", "gt", "concacaf", ["#0072c6", "#ffffff"]),
  n("guyana", "Guyana", "gy", "concacaf"),
  n("haiti", "Haiti", "ht", "concacaf"),
  n("honduras", "Honduras", "hn", "concacaf", ["#ffffff", "#0072c6"]),
  n("jamaica", "Jamaica", "jm", "concacaf", ["#ffdf00", "#0b0f10"], "adidas"),
  n("martinique", "Martinique", "mq", "concacaf"),
  n("mexico", "Mexico", "mx", "concacaf", ["#00734d", "#ffffff"], "adidas"),
  n("montserrat", "Montserrat", "ms", "concacaf"),
  n("nicaragua", "Nicaragua", "ni", "concacaf"),
  n("panama", "Panama", "pa", "concacaf", ["#e2001a", "#ffffff"]),
  n("puerto-rico", "Puerto Rico", "pr", "concacaf"),
  n("saint-lucia", "Saint Lucia", "lc", "concacaf"),
  n("saint-martin", "Saint-Martin", "mf", "concacaf"),
  n(
    "saint-vincent-and-the-grenadines",
    "St Vincent and the Grenadines",
    "vc",
    "concacaf",
  ),
  n("sint-maarten", "Sint Maarten", "sx", "concacaf"),
  n("st-kitts-and-nevis", "St Kitts and Nevis", "kn", "concacaf"),
  n("suriname", "Suriname", "sr", "concacaf"),
  n("trinidad-and-tobago", "Trinidad and Tobago", "tt", "concacaf", [
    "#e2001a",
    "#0b0f10",
  ]),
  n("turks-and-caicos-islands", "Turks and Caicos Islands", "tc", "concacaf"),
  n("us-virgin-islands", "US Virgin Islands", "vi", "concacaf"),
  n("usa", "USA", "us", "concacaf", ["#ffffff", "#173f7a"], "nike"),

  // ── CAF ─────────────────────────────────────────────────────────────────
  n("algeria", "Algeria", "dz", "caf", ["#ffffff", "#00734d"], "adidas"),
  n("angola", "Angola", "ao", "caf"),
  n("benin", "Benin", "bj", "caf"),
  n("botswana", "Botswana", "bw", "caf"),
  n("burkina-faso", "Burkina Faso", "bf", "caf"),
  n("burundi", "Burundi", "bi", "caf"),
  n("cabo-verde", "Cabo Verde", "cv", "caf", ["#0072c6", "#ffffff"]),
  n("cameroon", "Cameroon", "cm", "caf", ["#00734d", "#e2001a"]),
  n("central-african-republic", "Central African Republic", "cf", "caf"),
  n("chad", "Chad", "td", "caf"),
  n("comoros", "Comoros", "km", "caf"),
  n("congo", "Congo", "cg", "caf"),
  n("congo-dr", "DR Congo", "cd", "caf", ["#0072c6", "#e2001a"]),
  n(
    "cote-d-ivoire",
    "Côte d'Ivoire",
    "ci",
    "caf",
    ["#ff6600", "#ffffff"],
    "puma",
  ),
  n("djibouti", "Djibouti", "dj", "caf"),
  n("egypt", "Egypt", "eg", "caf", ["#e2001a", "#ffffff"]),
  n("equatorial-guinea", "Equatorial Guinea", "gq", "caf"),
  n("eritrea", "Eritrea", "er", "caf"),
  n("eswatini", "Eswatini", "sz", "caf"),
  n("ethiopia", "Ethiopia", "et", "caf"),
  n("gabon", "Gabon", "ga", "caf"),
  n("gambia", "Gambia", "gm", "caf"),
  n("ghana", "Ghana", "gh", "caf", ["#ffffff", "#0b0f10"], "puma"),
  n("guinea", "Guinea", "gn", "caf"),
  n("guinea-bissau", "Guinea-Bissau", "gw", "caf"),
  n("kenya", "Kenya", "ke", "caf"),
  n("lesotho", "Lesotho", "ls", "caf"),
  n("liberia", "Liberia", "lr", "caf"),
  n("libya", "Libya", "ly", "caf"),
  n("madagascar", "Madagascar", "mg", "caf"),
  n("malawi", "Malawi", "mw", "caf"),
  n("mali", "Mali", "ml", "caf", ["#ffdf00", "#00734d"]),
  n("mauritania", "Mauritania", "mr", "caf"),
  n("mauritius", "Mauritius", "mu", "caf"),
  n("morocco", "Morocco", "ma", "caf", ["#e2001a", "#00734d"], "puma"),
  n("mozambique", "Mozambique", "mz", "caf"),
  n("namibia", "Namibia", "na", "caf"),
  n("niger", "Niger", "ne", "caf"),
  n("nigeria", "Nigeria", "ng", "caf", ["#00734d", "#ffffff"], "nike"),
  n("reunion", "Réunion", "re", "caf"),
  n("rwanda", "Rwanda", "rw", "caf"),
  n("sao-tome-and-principe", "São Tomé and Príncipe", "st", "caf"),
  n("senegal", "Senegal", "sn", "caf", ["#ffffff", "#00734d"], "puma"),
  n("seychelles", "Seychelles", "sc", "caf"),
  n("sierra-leone", "Sierra Leone", "sl", "caf"),
  n("somalia", "Somalia", "so", "caf"),
  n("south-africa", "South Africa", "za", "caf", ["#ffdf00", "#00734d"]),
  n("south-sudan", "South Sudan", "ss", "caf"),
  n("sudan", "Sudan", "sd", "caf"),
  n("tanzania", "Tanzania", "tz", "caf"),
  n("togo", "Togo", "tg", "caf"),
  n("tunisia", "Tunisia", "tn", "caf", ["#ffffff", "#e2001a"], "kappa"),
  n("uganda", "Uganda", "ug", "caf"),
  n("zambia", "Zambia", "zm", "caf"),
  n("zanzibar", "Zanzibar", "zanzibar", "caf"),
  n("zimbabwe", "Zimbabwe", "zw", "caf"),

  // ── AFC ─────────────────────────────────────────────────────────────────
  n("afghanistan", "Afghanistan", "af", "afc"),
  n("australia", "Australia", "au", "afc", ["#ffdf00", "#00734d"], "nike"),
  n("bahrain", "Bahrain", "bh", "afc"),
  n("bangladesh", "Bangladesh", "bd", "afc"),
  n("bhutan", "Bhutan", "bt", "afc"),
  n("brunei", "Brunei", "bn", "afc"),
  n("cambodia", "Cambodia", "kh", "afc"),
  n("china", "China", "cn", "afc", ["#e2001a", "#ffdf00"], "nike"),
  n("hong-kong", "Hong Kong", "hk", "afc"),
  n("india", "India", "in", "afc", ["#0072c6", "#ffffff"]),
  n("indonesia", "Indonesia", "id", "afc", ["#e2001a", "#ffffff"]),
  n("iran", "Iran", "ir", "afc", ["#ffffff", "#e2001a"]),
  n("iraq", "Iraq", "iq", "afc", ["#00734d", "#ffffff"]),
  n("japan", "Japan", "jp", "afc", ["#173f7a", "#ffffff"], "adidas"),
  n("jordan", "Jordan", "jo", "afc"),
  n("kuwait", "Kuwait", "kw", "afc"),
  n("kyrgyzstan", "Kyrgyzstan", "kg", "afc"),
  n("laos", "Laos", "la", "afc"),
  n("lebanon", "Lebanon", "lb", "afc"),
  n("macau", "Macau", "mo", "afc"),
  n("malaysia", "Malaysia", "my", "afc"),
  n("maldives", "Maldives", "mv", "afc"),
  n("mongolia", "Mongolia", "mn", "afc"),
  n("myanmar", "Myanmar", "mm", "afc"),
  n("nepal", "Nepal", "np", "afc"),
  n("north-korea", "North Korea", "kp", "afc"),
  n("northern-mariana-islands", "Northern Mariana Islands", "mp", "afc"),
  n("guam", "Guam", "gu", "afc"),
  n("oman", "Oman", "om", "afc"),
  n("pakistan", "Pakistan", "pk", "afc"),
  n("palestine", "Palestine", "ps", "afc"),
  n("philippines", "Philippines", "ph", "afc"),
  n("qatar", "Qatar", "qa", "afc", ["#7d2248", "#ffffff"], "nike"),
  n("saudi-arabia", "Saudi Arabia", "sa", "afc", ["#ffffff", "#00734d"]),
  n("singapore", "Singapore", "sg", "afc"),
  n("south-korea", "South Korea", "kr", "afc", ["#e2001a", "#0b0f10"], "nike"),
  n("sri-lanka", "Sri Lanka", "lk", "afc"),
  n("syria", "Syria", "sy", "afc"),
  n("taiwan", "Chinese Taipei", "tw", "afc"),
  n("tajikistan", "Tajikistan", "tj", "afc"),
  n("thailand", "Thailand", "th", "afc"),
  n("timor-leste", "Timor-Leste", "tl", "afc"),
  n("turkmenistan", "Turkmenistan", "tm", "afc"),
  n("uae", "United Arab Emirates", "ae", "afc"),
  n("uzbekistan", "Uzbekistan", "uz", "afc"),
  n("vietnam", "Vietnam", "vn", "afc"),
  n("yemen", "Yemen", "ye", "afc"),

  // ── OFC ─────────────────────────────────────────────────────────────────
  n("american-samoa", "American Samoa", "as", "ofc"),
  n("cook-islands", "Cook Islands", "ck", "ofc"),
  n("fiji", "Fiji", "fj", "ofc"),
  n("kiribati", "Kiribati", "ki", "ofc"),
  n("nauru", "Nauru", "nr", "ofc"),
  n("new-caledonia", "New Caledonia", "nc", "ofc"),
  n("new-zealand", "New Zealand", "nz", "ofc", ["#ffffff", "#0b0f10"], "nike"),
  n("palau", "Palau", "pw", "ofc"),
  n("papua-new-guinea", "Papua New Guinea", "pg", "ofc"),
  n("samoa", "Samoa", "ws", "ofc"),
  n("solomon-islands", "Solomon Islands", "sb", "ofc"),
  n("tahiti", "Tahiti", "pf", "ofc"),
  n("tonga", "Tonga", "to", "ofc"),
  n("tuvalu", "Tuvalu", "tv", "ofc"),
  n("vanuatu", "Vanuatu", "vu", "ofc"),
];

/** Country ids whose flag emoji can't be derived from an ISO-2 code. */
const FLAG_OVERRIDES: Record<string, string | null> = {
  en: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  sct: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  wal: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  nir: null,
  xk: "🇽🇰",
  zanzibar: null,
};

const flagOf = (countryId: string): string | null => {
  if (countryId in FLAG_OVERRIDES) return FLAG_OVERRIDES[countryId] ?? null;
  if (!/^[a-z]{2}$/.test(countryId)) return null;
  return countryId
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
};

/** Team/country ids already shipped by core.ts — excluded from exports. */
const CORE_NATION_IDS = new Set([
  "argentina",
  "brazil",
  "uruguay",
  "england",
  "france",
  "germany",
  "italy",
  "spain",
  "netherlands",
  "portugal",
]);
const CORE_COUNTRY_IDS = new Set([
  "ar",
  "br",
  "uy",
  "en",
  "fr",
  "de",
  "it",
  "es",
  "nl",
  "pt",
]);

export const worldCountrySeeds: CountrySeed[] = NATION_ROWS.filter(
  (row) => !CORE_COUNTRY_IDS.has(row.countryId),
).map((row) => ({
  id: row.countryId,
  name: row.name === "USA" ? "United States" : row.name,
  flagEmoji: flagOf(row.countryId),
  source: "seed",
}));

export const worldNationTeamSeeds: TeamSeed[] = NATION_ROWS.filter(
  (row) => !CORE_NATION_IDS.has(row.id),
).map((row) => ({
  id: row.id,
  name: row.name,
  countryId: row.countryId,
  type: "national",
  ...(row.colors
    ? {
        primaryColor: row.colors[0],
        ...(row.colors[1] ? { secondaryColor: row.colors[1] } : {}),
      }
    : {}),
  source: "seed",
}));

/** countryId → confederation, for Explore's national-team grouping. */
export const confederationByCountry: Record<string, Confederation> =
  Object.fromEntries(
    NATION_ROWS.map((row) => [row.countryId, row.confederation]),
  );

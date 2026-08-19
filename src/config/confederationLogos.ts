import type { Confederation } from "@/db/seed/world";

/**
 * Confederation logos (Wikipedia infobox art — trademarked, fan/personal use
 * only), shown as Explore's national-team group icons. Several are dark
 * wordmarks, so render them on a light chip in the dark-only UI.
 */
export const CONFEDERATION_LOGOS: Record<Confederation, number> = {
  conmebol: require("../../assets/logos/confederations/conmebol.png") as number,
  uefa: require("../../assets/logos/confederations/uefa.png") as number,
  concacaf: require("../../assets/logos/confederations/concacaf.png") as number,
  caf: require("../../assets/logos/confederations/caf.png") as number,
  afc: require("../../assets/logos/confederations/afc.png") as number,
  ofc: require("../../assets/logos/confederations/ofc.png") as number,
};

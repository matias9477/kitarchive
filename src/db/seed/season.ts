/**
 * Horizon for generated season/cycle seed rows. Seeding up to the current
 * calendar year yields an era that runs into next year (e.g. in 2026 the
 * latest Boca era is 2026/27), so upcoming-season shirts are always
 * cataloguable without a release. `applySeed` encodes this year into the
 * stored seed version, so the insert-only seeder re-runs on year rollover
 * and adds the new eras/kits.
 */
export const LATEST_SEASON_START = new Date().getFullYear();

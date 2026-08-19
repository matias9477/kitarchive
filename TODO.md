# TODO

- [x] Default teams: seeded 225 national teams (all confederations) + ~290 clubs (big-5 Europe, Argentina incl. iconic lower-division sides, Brazil, MLS, Uruguay, Chile, continental giants) with generated 2014+ seasons. Explore groups national teams by confederation and clubs by country.
- [ ] Crests: 44 national logos are SVG, the rest are interim 512px PNGs (SVG host rate-limited us). Upgrade PNGs → SVG (VPN or cooldown), download club crests for the new leagues, and decide bundle-size strategy (svgo / on-demand). Sources + hashes saved in scratchpad manifest.
- [ ] Widget team picker still lists only the original teams (enum baked in app.json) — decide curated subset vs favorites-driven.
  - [x] National-team logos: SVG crest library downloaded from football-logos.cc into `assets/logos/national/` (plus Primera División clubs in `assets/logos/clubs/argentina/`), bundled via `src/config/teamLogos.ts`, shown on team rows/detail, user-overridable per team (bundled crest or custom photo). Note: trademarked art, fan/non-commercial use per the source site's license — revisit before any paid release.

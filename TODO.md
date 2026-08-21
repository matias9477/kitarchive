# TODO

- [x] Default teams: seeded 225 national teams (all confederations) + ~290 clubs (big-5 Europe, Argentina incl. iconic lower-division sides, Brazil, MLS, Uruguay, Chile, continental giants) with generated 2014+ seasons. Explore drills down: clubs by country, national teams by confederation (with federation logos).
- [x] Crests: every seeded team (498 entries) has bundled art; user-overridable per team (bundled crest or custom photo).
- [x] Crest weight: PNGs downscaled to 256px max + palette-quantized (logos 19 MB → 8.1 MB), SVGs run through svgo. Remaining (non-blocking): 43 national crests are SVG, the rest interim PNGs — upgrade to SVG when the source's image host unbans us (or via VPN; hashes saved in scratchpad manifest).
- [ ] Widget team picker still lists only the original teams (enum baked in app.json) — decide curated subset vs favorites-driven (e.g. `favorite_1..n` slot enum mapped via App Group data); either way needs a new binary.
- [ ] Licensing before any *paid* release: crests/flags/confederation logos are trademarked art, fan/non-commercial use per the sources.

## UX
- [x] Onboarding flow: 3-slide first-launch pager (`Onboarding` route, skip/CTA, flag in settings row).
- [x] Empty states: audited every screen; added missing treatment to bulk-add team search.
- [x] Loading states: `Skeleton`/`SkeletonList` shared components; skeletons on Home, Collection, Wishlist, Explore, ExploreGroup, TeamDetail, KitDetail, ItemDetail (stores expose `hasLoaded` so lists never flash "empty" on first load).
- [x] Third view mode: dense text-only "compact" list in the view toggle (grid → list → compact) on Collection, Wishlist, TeamDetail.
- [x] Home sections capped with show all/less (`ExpandToggle`): favorites tiles, archive progress, by-team counts, duplicates.

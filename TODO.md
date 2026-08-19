# TODO

- [x] Default teams: seeded 225 national teams (all confederations) + ~290 clubs (big-5 Europe, Argentina incl. iconic lower-division sides, Brazil, MLS, Uruguay, Chile, continental giants) with generated 2014+ seasons. Explore drills down: clubs by country, national teams by confederation (with federation logos).
- [x] Crests: every seeded team (498 entries) has bundled art; user-overridable per team (bundled crest or custom photo).
- [ ] Crest polish (non-blocking): 43 national crests are SVG, the rest interim 512px PNGs — upgrade to SVG when the source's image host unbans us (or via VPN; hashes saved in scratchpad manifest). Assets weigh ~19 MB — consider svgo/downscale or on-demand loading.
- [ ] Widget team picker still lists only the original teams (enum baked in app.json) — decide curated subset vs favorites-driven; needs a new binary.
- [ ] Licensing before any *paid* release: crests/flags/confederation logos are trademarked art, fan/non-commercial use per the sources.

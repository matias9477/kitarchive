# CLAUDE.md

## Project

"kitarchive" — a football-shirt collection archive (React Native + Expo,
TypeScript). Local-only data via SQLite + Drizzle ORM, Zustand for state, and
an iOS home-screen widget powered by first-party `expo-widgets`.

Domain model (see `football_kit_collection_app_spec.md`): **catalogue what
exists, track what you own.** Catalogue entities (countries → teams → eras →
kits, plus manufacturers/competitions/add-ons/players) are seeded and
user-extendable; a _Collection Item_ is one physical shirt attached to exactly
one catalogue Kit; the wishlist references Kits; "missing" is derived
(catalogue − owned), never stored. Patches are add-ons on physical items, not
separate Kits. Design tokens live in `DESIGN.md` — the app is **dark-only**.

## Commands

- `npm start` — Expo dev server
- `npm run ios` / `npm run android` — `expo run:*` (native build; required for the widget / notifications, not Expo Go)
- `npm test` / `npm run test:watch` — Jest (preset `jest-expo`)
- Run a single test: `npx jest path/to/file.test.ts` (or `-t "test name"`)
- `npm run lint` / `npm run lint:check` — ESLint over `.ts,.tsx`
- `npm run format` / `npm run format:check` — Prettier
- `npm run commit` — commitizen (conventional commits, enforced by commitlint)
- `npm run release` — `expo-release` (bumps version in package.json + app.json, tags, builds, submits)
- `npm run db:generate` — generate Drizzle migration files from `src/db/schema.ts`
- `db:studio` / `db:push` — **do not use**: incompatible with `expo-sqlite`. Migrations are applied manually in `src/db/client.ts`.

## Architecture

### Data layer

SQLite via `expo-sqlite`, wrapped with Drizzle in `src/db/client.ts`.
`initializeDatabase()` runs once from `App.tsx`: raw `CREATE TABLE IF NOT EXISTS`
statements, a default settings row, then the catalogue seed. The Drizzle schema
in `src/db/schema.ts` must be kept in sync with those raw statements — there is
no automated migration runner. All DB access goes through per-feature service
modules; components never touch Drizzle directly.

Shared domain unions (`KitType`, `Condition`, `ProductVersion`, `Edition`,
`BackType`, …) live in `src/config/types.ts` with ordered picker lists in
`src/config/constants.ts`; adding a value also needs `enums.*` labels in both
locales.

### Catalogue seed (`src/db/seed/`)

Versioned, **insert-only** seeder (`SEED_VERSION` in `seed/index.ts`): rows are
inserted `ON CONFLICT DO NOTHING` by stable slug IDs, so in-app corrections to
seed rows are never overwritten — bumping the version only _adds_ rows. Every
catalogue row carries `source: 'seed' | 'user'`. Seed data is best-effort
historical research (Boca 1995–2025, Argentina 1990–2026, top-10 national
teams 2018+); referential integrity is enforced by
`src/db/seed/__tests__/seed.test.ts` — run it after touching seed files.

### Feature modules (`src/features/<feature>/`)

`catalogue`, `collection`, `wishlist`, `stats`, `search`, `settings`. Each owns
`types.ts`, `<feature>Service.ts` (CRUD against Drizzle) and `<feature>Store.ts`
(Zustand store wrapping the service). New domain logic follows the same
triplet. Screens reload via `useFocusEffect`, so stores don't need
cross-invalidation. Collection mutations call `syncWidget()`.

Item photos and kit reference images are copied into the app documents dir by
`src/lib/images.ts`; the DB stores the resulting `file://` URI, and deleting an
item/photo also deletes its stored files.

### UI / navigation

Screens in `src/app/`, reusable components in `src/components/` (`shared/` for
primitives like `AppText`/`Chip`/`PickerField`, `kits/` for domain cards),
navigation in `src/navigation/`. Tab bar: Home · Collection · [raised + Add
button] · Explore · Wishlist; the Add flow, forms and catalogue-extension
screens are modals on the root stack.

Theming via `src/theme/` (`useTheme()` → `colors`/`typography`/`spacing`/
`radius`, tokens from DESIGN.md). The app ships **dark-only** — there is no
theme toggle; never hardcode colors or font styles. Fonts are Sora (display,
numerals) + Inter (UI), loaded in `App.tsx` via `@expo-google-fonts/*` — the
family names there must match `src/theme/typography.ts`.

### iOS widget (`src/widgets/`)

First-party `expo-widgets` — no Swift. The widget is a `.tsx` module whose
component carries the `'widget'` directive and renders `@expo/ui/swift-ui`
components; `createWidget()` exports the handle. Declared in `app.json` under
`plugins → expo-widgets`, which also owns the App Group `group.com.matiasturra.kitarchive`.

- The widget shows per-team collection progress. Push data with
  `syncWidget()` (`src/lib/widget.ts`), which snapshots all team counts; the
  props type lives in `src/widgets/KitsWidget.tsx` — change both together.
- Each widget instance is configured to one team via the `teamId` **static
  enum** parameter declared in `app.json`; the component reads the choice from
  `environment.configuration` (iOS 17+). The installed `expo-widgets` has no
  dynamic-enum API — enum values are baked at build time, so user-created teams
  don't appear in the picker without a new binary. The plugin codegens enum
  values into a Swift enum, so they must be Swift identifiers
  (`^[A-Za-z_][A-Za-z0-9_]*$`): values are seed team IDs with `-` → `_`,
  decoded in `KitsWidget.tsx` (enforced by the seed test).
- Families and parameter shape/values live in `app.json` and need a new binary
  to change.
- Requires a development build — widgets do not work in Expo Go. `expo-widgets`
  throws at _import_ time when the native module is missing (and with Metro
  lazy bundling that throw escapes try/catch around require), so app code must
  never import `@/widgets/KitsWidget` (or `expo-widgets`) by value:
  `src/lib/widget.ts` probes `requireOptionalNativeModule('ExpoWidgets')`
  first and only then lazy-requires the widget, no-oping in Expo Go.
  Type-only imports are fine.

#### Intentionally empty modules

`src/features/purchases/` and `src/features/onboarding/` are scaffolded as empty
directories, not stubs — `react-native-purchases` is installed but unwired. Fill
them with the dedicated skills rather than by hand:

- purchases + paywall → `/setup-revenuecat-paywall`
- `Paywall` / `Onboarding` routes are deliberately absent from
  `RootStackParamList` and the linking config; add them when the screens exist,
  so navigation never declares a route it cannot resolve.

#### When to add `@bacons/apple-targets`

Deliberately **not** installed. `expo-widgets` covers widgets and Live
Activities; `apple-targets` is the only way to get any _other_ Apple target.
Add it when you actually need one of:

- Share extension (accept content from the iOS share sheet)
- Watch app or complications
- App Clip
- Notification service extension (rich push, image attachments, decryption)
- Safari or iMessage extension
- A widget layout `@expo/ui/swift-ui` can't express — `apple-targets` lets you
  write raw SwiftUI, `expo-widgets` does not

To add: `npx expo install @bacons/apple-targets`, add the plugin to `app.json`,
and create `targets/<name>/expo-target.config.js`. Keep the App Group
identifier identical to the one in the `expo-widgets` block — both plugins write
entitlements during prebuild, so a mismatch there is the first thing to check if
prebuild starts misbehaving. Note that `apple-targets` bundles its own
`@expo/prebuild-config`, which may lag the installed SDK; run `expo-doctor`
after adding it.

### i18n

`src/i18n/index.ts` initializes i18next before any screen renders. Locales in
`src/i18n/locales/*.json`. `src/store/languageStore.ts` persists the preference
('system' | 'en' | 'es'); `App.tsx` re-mounts the tree on change.

## Conventions

- Path aliases: `@/...` → `./src/...`. `tsconfig.json` and `babel.config.js`
  must stay in sync — adding an alias requires editing both.
- TypeScript strict, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- Conventional commits, enforced by commitlint. Types: `feat, fix, docs, style,
refactor, perf, test, chore, ci, build, revert`.

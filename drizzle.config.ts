import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config for Expo SQLite.
 *
 * Works:      `npm run db:generate`, `npm run db:introspect`
 * Does NOT:   `drizzle-kit studio` / `push` — they need better-sqlite3 or
 *             @libsql/client, which are incompatible with expo-sqlite.
 *             Migrations are applied manually in src/db/client.ts.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: { url: "./kitarchive.db" },
  verbose: true,
  strict: true,
});

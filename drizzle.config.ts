import { defineConfig } from "drizzle-kit";

// Schema is the source of truth. `pnpm db:generate` writes SQL migrations to
// ./drizzle, and `wrangler d1 migrations apply inovatech --local|--remote`
// runs them.
export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID ?? "",
    token: process.env.CLOUDFLARE_D1_TOKEN ?? "",
  },
});

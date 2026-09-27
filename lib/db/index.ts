import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Db = DrizzleD1Database<typeof schema>;

const dbCache = new WeakMap<D1Database, Db>();

/**
 * One Drizzle instance per D1 binding, cached for the life of the isolate.
 * `getCloudflareContext` works in RSC, Server Actions and Route Handlers. In
 * `next dev` the binding comes from `initOpenNextCloudflareForDev()` (local
 * miniflare, see next.config.ts), so the same code runs in dev and prod.
 */
export async function getDb(): Promise<Db> {
  const { env } = await getCloudflareContext({ async: true });
  const d1 = env.DB;
  let db = dbCache.get(d1);
  if (!db) {
    db = drizzle(d1, { schema });
    dbCache.set(d1, db);
  }
  return db;
}

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export { schema };

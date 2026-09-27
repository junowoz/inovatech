import "server-only";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { SESSION_COOKIE } from "./constants";

/**
 * Cookie-based sessions (replaces Supabase Auth's session cookies) for the
 * small admin allowlist. The cookie holds only an opaque session id; the
 * session row (with its expiry) lives in D1, checked on every privileged read.
 */

export { SESSION_COOKIE };

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export async function createSession(adminUserId: string): Promise<void> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(schema.adminSession).values({
    id,
    adminUserId,
    expiresAt,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  store.delete(SESSION_COOKIE);
  if (!id) return;

  const db = await getDb();
  await db.delete(schema.adminSession).where(eq(schema.adminSession.id, id));
}

/** Verifies the session cookie against D1 and returns the admin, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const db = await getDb();
  const rows = await db
    .select({
      sessionId: schema.adminSession.id,
      expiresAt: schema.adminSession.expiresAt,
      userId: schema.adminUser.id,
      email: schema.adminUser.email,
      name: schema.adminUser.name,
    })
    .from(schema.adminSession)
    .innerJoin(
      schema.adminUser,
      eq(schema.adminSession.adminUserId, schema.adminUser.id)
    )
    .where(eq(schema.adminSession.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (row.expiresAt.getTime() < Date.now()) {
    await db
      .delete(schema.adminSession)
      .where(eq(schema.adminSession.id, row.sessionId));
    return null;
  }

  return { id: row.userId, email: row.email, name: row.name };
}

import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser, type SessionUser } from "@/lib/auth/session";

/** Returns the authenticated admin (verified against D1) or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

/**
 * Every row in `adminUser` is an admin — there is no separate role table
 * (the old Supabase `admins` allowlist collapses into the user table itself).
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return Boolean(user);
}

/** Server-side guard: redirect to /login when there is no authenticated user. */
export async function requireUser(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** Server-side guard for admin pages and actions. */
export async function requireAdmin(redirectTo = "/login"): Promise<SessionUser> {
  return requireUser(redirectTo);
}

/** Capitalized first name (falls back to email) for greetings. */
export function userDisplayName(user: SessionUser | null): string | null {
  const first = user?.name?.split(" ")[0];
  if (first && first.length > 0) {
    return first[0].toUpperCase() + first.slice(1).toLowerCase();
  }
  return user?.email ?? null;
}

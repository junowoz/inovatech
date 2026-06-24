import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/** Returns the authenticated user (verified against Supabase) or null. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

async function userIsAdmin(user: User): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[auth] admin lookup:", error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error("[auth] admin lookup:", error);
    return false;
  }
}

/** Returns true only for authenticated users listed in public.admins. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? userIsAdmin(user) : false;
}

/** Server-side guard: redirect to /login when there is no authenticated user. */
export async function requireUser(redirectTo = "/login"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** Server-side guard for admin pages and actions. */
export async function requireAdmin(redirectTo = "/login"): Promise<User> {
  const user = await requireUser(redirectTo);
  if (!(await userIsAdmin(user))) redirect("/");
  return user;
}

/** Capitalized first name (falls back to email) for greetings. */
export function userDisplayName(user: User | null): string | null {
  const first = user?.user_metadata?.first_name;
  if (typeof first === "string" && first.length > 0) {
    return first[0].toUpperCase() + first.slice(1).toLowerCase();
  }
  return user?.email ?? null;
}

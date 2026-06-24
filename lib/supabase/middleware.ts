import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";
import { hasSupabaseEnv, getSupabaseEnv } from "./env";

const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Refreshes the Supabase auth session on every request and guards protected
 * routes server-side. Must not run other async work between client creation
 * and `getUser()` (per Supabase SSR guidance).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Without env configured, skip auth handling so the app still renders.
  if (!hasSupabaseEnv()) {
    return supabaseResponse;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

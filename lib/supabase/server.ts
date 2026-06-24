import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Request-scoped Supabase client for Server Components, Route Handlers and
 * Server Actions. Reads/writes the auth session from the request cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `setAll` was called from a Server Component where cookies are
          // read-only. The session is refreshed by the middleware instead, so
          // this can be safely ignored.
        }
      },
    },
  });
}

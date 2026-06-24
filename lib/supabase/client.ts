import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";
import { getSupabaseEnv } from "./env";

/** Browser-side Supabase client (uses the public anon key + cookie session). */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}

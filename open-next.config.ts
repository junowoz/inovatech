import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No ISR/`revalidatePath` persistence across isolates is needed for this app
// (small admin-triggered revalidations only) — defaults (in-memory) are
// enough. See Vitae's open-next.config.ts for the R2 + Durable Objects setup
// if this project ever needs cross-isolate ISR caching.
export default defineCloudflareConfig({});

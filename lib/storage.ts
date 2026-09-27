import "server-only";

import { getEnv } from "@/lib/db";

/**
 * Media storage on Cloudflare R2 (replaces the Supabase Storage `midia`
 * bucket). Uses the shared `junowoz-bucket` (already provisioned for other
 * projects, see ~/code/toolbox/shared_docs/operations/STACK.md) under the
 * `inovatech/` key prefix, so no new cloud resource is created by this app.
 *
 * There is no public bucket URL: objects are served through the app's own
 * `/midia/[...path]` route (lib below builds paths, the route streams bytes
 * from the binding). This avoids enabling public bucket access or a custom
 * domain, both of which would be a cloud-resource change.
 */

const KEY_PREFIX = "inovatech/";

function fullKey(path: string): string {
  return `${KEY_PREFIX}${path.replace(/^\/+/, "")}`;
}

export async function putObject(
  path: string,
  data: ArrayBuffer | Uint8Array | ReadableStream,
  contentType?: string
): Promise<void> {
  const env = await getEnv();
  await env.BUCKET.put(fullKey(path), data, {
    httpMetadata: contentType ? { contentType } : undefined,
  });
}

export async function getObject(path: string) {
  const env = await getEnv();
  return env.BUCKET.get(fullKey(path));
}

export async function removeObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const env = await getEnv();
  await env.BUCKET.delete(paths.map(fullKey));
}

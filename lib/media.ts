/**
 * Helpers for the legacy media storage format. Image columns hold a JSON string
 * `{"path": string[]}` pointing at objects in the Supabase `midia` bucket.
 */

const MIDIA_BASE = process.env.NEXT_PUBLIC_MIDIA_URL ?? "";

function pathArray(value: unknown): string[] {
  if (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { path?: unknown }).path)
  ) {
    return (value as { path: unknown[] }).path.filter(
      (p: unknown): p is string => typeof p === "string" && p.length > 0
    );
  }
  return [];
}

/** Parse a stored image column into an array of storage paths. */
export function parseImagePaths(value: unknown): string[] {
  if (!value) return [];
  const direct = pathArray(value);
  if (direct.length > 0) return direct;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    const paths = pathArray(parsed);
    if (paths.length > 0) return paths;
  } catch {
    // Not valid JSON — treat as a single bare path for resilience.
    return [value];
  }
  return [];
}

/** Serialize storage paths back into the legacy JSON-string column format. */
export function serializeImagePaths(paths: string[]): string {
  return JSON.stringify({ path: paths });
}

/** Build a public CDN URL for a storage path (always a valid image src). */
export function mediaUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  if (!MIDIA_BASE) return `/${path.replace(/^\/+/, "")}`;
  return `${MIDIA_BASE}${path}`;
}

/** Public URL of the first image in a stored column, or a fallback. */
export function firstImageUrl(
  value: string | null | undefined,
  fallback = "/no-image.png"
): string {
  const [first] = parseImagePaths(value);
  return first ? mediaUrl(first) : fallback;
}

/** Public URLs for every image in a stored column. */
export function imageUrls(value: string | null | undefined): string[] {
  return parseImagePaths(value).map(mediaUrl);
}

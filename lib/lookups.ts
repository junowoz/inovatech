import type { LookupRow } from "@/lib/types/database";

/** Resolve a lookup id to its human-readable name. */
export function lookupName(
  rows: LookupRow[] | undefined,
  id: number | null | undefined
): string {
  if (id == null || !rows) return "";
  return rows.find((row) => row.id === id)?.name ?? "";
}

/** Build an id → name map for O(1) label lookups. */
export function toLabelMap(rows: LookupRow[]): Map<number, string> {
  return new Map(rows.map((row) => [row.id, row.name]));
}

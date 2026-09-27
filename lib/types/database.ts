/**
 * Database row shapes for the Inovatech D1 (SQLite) schema. Source of truth
 * for the columns is `lib/db/schema.ts` (Drizzle); these are the plain
 * read/write shapes the app code (queries, actions, components) works with.
 *
 * Compatibility note: `logoImg` / `teamImg` / `productImg` are stored as JSON
 * *strings* of the shape `{"path": string[]}` (legacy format preserved so
 * existing rows, migrated from Supabase, keep rendering). Use the helpers in
 * `lib/media.ts` to read/write them.
 */

export type LookupRow = {
  id: number;
  name: string;
};

export type ProjectRow = {
  id: number;
  projectUUID: string;
  name: string;
  slogan: string | null;
  projectDescription: string | null;
  targetAudience: string | null;
  productDescription: string | null;
  projectViability: string | null;
  link: string | null;
  year: number | null;
  semester: number | null;
  course: number | null;
  tech: number | null;
  industry: number | null;
  /** JSON string: {"path": string[]} */
  logoImg: string | null;
  /** JSON string: {"path": string[]} */
  teamImg: string | null;
  /** JSON string: {"path": string[]} */
  productImg: string | null;
  date: string;
  status: boolean;
};

export type ProjectInsert = Omit<ProjectRow, "id"> & { id?: number };
export type ProjectUpdate = Partial<Omit<ProjectRow, "id">>;

export type MemberRow = {
  id: number;
  projectUUID: string;
  /** Array of member display names (may arrive as text[] or a serialized form). */
  name: string[] | string | null;
  contact: string | null;
  isFounder: boolean | null;
  isLeader: boolean;
};

export type MemberInsert = Omit<MemberRow, "id" | "name"> & {
  id?: number;
  /** Persisted as a JSON string for compatibility with the legacy text column. */
  name: string;
};

/** Lookup tables keyed by id, used for rendering human-readable labels. */
export type LookupKind = "year" | "semester" | "course" | "tech" | "industry";

export interface Lookups {
  year: LookupRow[];
  semester: LookupRow[];
  course: LookupRow[];
  tech: LookupRow[];
  industry: LookupRow[];
}

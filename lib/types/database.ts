/**
 * Database schema types for the Inovatech Supabase project.
 *
 * Compatibility note: `logoImg` / `teamImg` / `productImg` are stored as JSON
 * *strings* of the shape `{"path": string[]}` (legacy format preserved so existing
 * rows keep rendering). Use the helpers in `lib/media.ts` to read/write them.
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

export type AdminRow = {
  user_id: string;
  created_at: string;
};

type Table<Row, Insert = Row, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      project: Table<ProjectRow, ProjectInsert, ProjectUpdate>;
      member: Table<MemberRow, MemberInsert>;
      year: Table<LookupRow>;
      semester: Table<LookupRow>;
      course: Table<LookupRow>;
      tech: Table<LookupRow>;
      industry: Table<LookupRow>;
      admins: Table<AdminRow, { user_id: string; created_at?: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Lookup tables keyed by id, used for rendering human-readable labels. */
export type LookupKind =
  | "year"
  | "semester"
  | "course"
  | "tech"
  | "industry";

export interface Lookups {
  year: LookupRow[];
  semester: LookupRow[];
  course: LookupRow[];
  tech: LookupRow[];
  industry: LookupRow[];
}

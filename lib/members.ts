import type { MemberRow } from "@/lib/types/database";

/**
 * Member names are stored as an array, but depending on how the row was written
 * they can come back as a real array, a JSON string, or a Postgres array literal
 * (`{a,b}`). Normalize all of these into a clean string[].
 */
export function parseMemberNames(name: MemberRow["name"]): string[] {
  if (Array.isArray(name)) {
    return name.map((n) => String(n).trim()).filter(Boolean);
  }

  if (typeof name === "string") {
    const trimmed = name.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((n) => String(n).trim()).filter(Boolean);
      }
    } catch {
      // fall through to array-literal handling
    }

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((part) => part.replace(/^"|"$/g, "").trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

export interface NormalizedMember {
  id: number;
  names: string[];
  contact: string | null;
  isFounder: boolean;
  isLeader: boolean;
}

/** Split members into leaders (founders first) and a flat list of common names. */
export function normalizeMembers(members: MemberRow[]): {
  leaders: NormalizedMember[];
  commonNames: string[];
} {
  const leaders: NormalizedMember[] = [];
  const commonNames: string[] = [];

  for (const member of members) {
    const names = parseMemberNames(member.name);
    if (member.isLeader) {
      leaders.push({
        id: member.id,
        names,
        contact: member.contact,
        isFounder: Boolean(member.isFounder),
        isLeader: true,
      });
    } else {
      commonNames.push(...names);
    }
  }

  leaders.sort((a, b) => Number(b.isFounder) - Number(a.isFounder));

  return { leaders, commonNames };
}

/** Heuristic: a contact is a LinkedIn URL vs. an email address. */
export function contactKind(contact: string | null): "linkedin" | "email" | null {
  if (!contact) return null;
  return /linkedin\.com/i.test(contact) ? "linkedin" : "email";
}

export function contactHref(contact: string): string {
  if (/linkedin\.com/i.test(contact)) {
    return contact.startsWith("http") ? contact : `https://${contact}`;
  }
  return `mailto:${contact}`;
}

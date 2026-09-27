import "server-only";

import { desc, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import type { Lookups, MemberRow, ProjectRow } from "@/lib/types/database";

/**
 * Read queries fail soft: on a genuine error they log and return an
 * empty/neutral value so pages still render.
 */

export async function getPublishedProjects(): Promise<ProjectRow[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.project)
      .where(eq(schema.project.status, true))
      .orderBy(desc(schema.project.date));
    return rows as ProjectRow[];
  } catch (error) {
    console.error("[queries] getPublishedProjects:", error);
    return [];
  }
}

export async function getProjectBySlug(
  name: string
): Promise<ProjectRow | null> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.project)
      .where(eq(schema.project.name, name))
      .limit(1);
    const row = rows[0];
    if (!row || !row.status) return null;
    return row as ProjectRow;
  } catch (error) {
    console.error("[queries] getProjectBySlug:", error);
    return null;
  }
}

export async function getProjectMembers(
  projectUUID: string
): Promise<MemberRow[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.member)
      .where(eq(schema.member.projectUUID, projectUUID));
    return rows as MemberRow[];
  } catch (error) {
    console.error("[queries] getProjectMembers:", error);
    return [];
  }
}

export async function getLookups(): Promise<Lookups> {
  try {
    const db = await getDb();
    const [year, semester, course, tech, industry] = await Promise.all([
      db.select().from(schema.year).orderBy(schema.year.id),
      db.select().from(schema.semester).orderBy(schema.semester.id),
      db.select().from(schema.course).orderBy(schema.course.id),
      db.select().from(schema.tech).orderBy(schema.tech.id),
      db.select().from(schema.industry).orderBy(schema.industry.id),
    ]);
    return { year, semester, course, tech, industry };
  } catch (error) {
    console.error("[queries] getLookups:", error);
    return { year: [], semester: [], course: [], tech: [], industry: [] };
  }
}

/** Admin view: every project regardless of publish status. Caller must auth-guard. */
export async function getAllProjects(): Promise<ProjectRow[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.project)
      .orderBy(desc(schema.project.date));
    return rows as ProjectRow[];
  } catch (error) {
    console.error("[queries] getAllProjects:", error);
    return [];
  }
}

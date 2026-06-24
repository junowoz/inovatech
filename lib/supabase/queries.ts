import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Lookups, MemberRow, ProjectRow } from "@/lib/types/database";

/**
 * Read queries fail soft: on a genuine error (or missing configuration) they log
 * and return an empty/neutral value so pages still render. Next.js control-flow
 * errors (dynamic usage, redirect, notFound) are re-thrown untouched.
 */
function isFrameworkError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const digest = (error as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" ||
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"))
  );
}

export async function getPublishedProjects(): Promise<ProjectRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .eq("status", true)
      .order("date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    if (isFrameworkError(error)) throw error;
    console.error("[queries] getPublishedProjects:", error);
    return [];
  }
}

export async function getProjectBySlug(
  name: string
): Promise<ProjectRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .eq("name", name)
      .eq("status", true)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  } catch (error) {
    if (isFrameworkError(error)) throw error;
    console.error("[queries] getProjectBySlug:", error);
    return null;
  }
}

export async function getProjectMembers(
  projectUUID: string
): Promise<MemberRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("member")
      .select("*")
      .eq("projectUUID", projectUUID);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    if (isFrameworkError(error)) throw error;
    console.error("[queries] getProjectMembers:", error);
    return [];
  }
}

export async function getLookups(): Promise<Lookups> {
  try {
    const supabase = await createClient();
    const [year, semester, course, tech, industry] = await Promise.all([
      supabase.from("year").select("*").order("id", { ascending: true }),
      supabase.from("semester").select("*").order("id", { ascending: true }),
      supabase.from("course").select("*").order("id", { ascending: true }),
      supabase.from("tech").select("*").order("id", { ascending: true }),
      supabase.from("industry").select("*").order("id", { ascending: true }),
    ]);

    return {
      year: year.data ?? [],
      semester: semester.data ?? [],
      course: course.data ?? [],
      tech: tech.data ?? [],
      industry: industry.data ?? [],
    };
  } catch (error) {
    if (isFrameworkError(error)) throw error;
    console.error("[queries] getLookups:", error);
    return { year: [], semester: [], course: [], tech: [], industry: [] };
  }
}

/** Admin view: every project regardless of publish status. Caller must auth-guard. */
export async function getAllProjects(): Promise<ProjectRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    if (isFrameworkError(error)) throw error;
    console.error("[queries] getAllProjects:", error);
    return [];
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";

import { isCurrentUserAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { parseImagePaths } from "@/lib/media";
import { removeObjects } from "@/lib/storage";
import { projectUpdateSchema } from "@/lib/validations/admin";

export interface ActionResult {
  success?: boolean;
  error?: string;
}

function revalidateProjectViews() {
  revalidatePath("/dashboard");
  revalidatePath("/projetos");
  revalidatePath("/");
}

export async function setProjectsStatus(
  ids: number[],
  status: boolean
): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) return { error: "Não autorizado." };
  if (ids.length === 0) return { success: true };

  try {
    const db = await getDb();
    await db
      .update(schema.project)
      .set({ status })
      .where(inArray(schema.project.id, ids));
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  revalidateProjectViews();
  return { success: true };
}

export async function deleteProjectAction(id: number): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) return { error: "Não autorizado." };

  const db = await getDb();

  const rows = await db
    .select({
      logoImg: schema.project.logoImg,
      teamImg: schema.project.teamImg,
      productImg: schema.project.productImg,
    })
    .from(schema.project)
    .where(eq(schema.project.id, id))
    .limit(1);

  const data = rows[0];
  if (data) {
    const paths = [
      ...parseImagePaths(data.logoImg),
      ...parseImagePaths(data.teamImg),
      ...parseImagePaths(data.productImg),
    ];
    if (paths.length > 0) {
      await removeObjects(paths);
    }
  }

  try {
    await db.delete(schema.project).where(eq(schema.project.id, id));
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  revalidateProjectViews();
  return { success: true };
}

export async function updateProjectAction(
  id: number,
  input: unknown
): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) return { error: "Não autorizado." };

  const parsed = projectUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    const db = await getDb();
    await db
      .update(schema.project)
      .set(parsed.data)
      .where(eq(schema.project.id, id));
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  revalidateProjectViews();
  return { success: true };
}

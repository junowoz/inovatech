"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserAdmin } from "@/lib/auth";
import { parseImagePaths } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("project")
    .update({ status })
    .in("id", ids);

  if (error) return { error: error.message };
  revalidateProjectViews();
  return { success: true };
}

export async function deleteProjectAction(id: number): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) return { error: "Não autorizado." };

  const supabase = await createClient();

  const { data } = await supabase
    .from("project")
    .select("logoImg, teamImg, productImg")
    .eq("id", id)
    .maybeSingle();

  if (data) {
    const paths = [
      ...parseImagePaths(data.logoImg),
      ...parseImagePaths(data.teamImg),
      ...parseImagePaths(data.productImg),
    ];
    if (paths.length > 0) {
      await supabase.storage.from("midia").remove(paths);
    }
  }

  const { error } = await supabase.from("project").delete().eq("id", id);
  if (error) return { error: error.message };

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

  const supabase = await createClient();
  const { error } = await supabase
    .from("project")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidateProjectViews();
  return { success: true };
}

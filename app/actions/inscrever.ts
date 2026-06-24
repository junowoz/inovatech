"use server";

import { revalidatePath } from "next/cache";

import { serializeImagePaths } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import type {
  MemberInsert,
  ProjectInsert,
} from "@/lib/types/database";
import {
  submitProjectSchema,
  type SubmitProjectInput,
} from "@/lib/validations/inscrever";

export interface SubmitResult {
  success?: boolean;
  error?: string;
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function removeUploaded(supabase: ServerClient, paths: string[]) {
  if (paths.length === 0) return;
  try {
    await supabase.storage.from("midia").remove(paths);
  } catch (error) {
    console.error("[inscrever] storage cleanup:", error);
  }
}

/**
 * Registers a project and its members in a single transactional flow:
 * 1. insert the project (status = false, awaiting admin approval)
 * 2. insert the members
 * On any failure everything is rolled back (project row + uploaded images).
 */
export async function submitProjectAction(
  payload: SubmitProjectInput
): Promise<SubmitResult> {
  const parsed = submitProjectSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: "Dados inválidos. Verifique o formulário e tente novamente.",
    };
  }

  const input = parsed.data;
  const supabase = await createClient();
  const allPaths = [
    ...input.images.logo,
    ...input.images.team,
    ...input.images.product,
  ];

  const projectRow: ProjectInsert = {
    projectUUID: input.projectUUID,
    name: input.name,
    slogan: input.slogan,
    projectDescription: input.projectDescription,
    targetAudience: input.targetAudience,
    productDescription: input.productDescription,
    projectViability: input.projectViability,
    link: input.link ? input.link : null,
    year: input.year,
    semester: input.semester,
    course: input.course,
    tech: input.tech,
    industry: input.industry,
    logoImg: input.images.logo.length
      ? serializeImagePaths(input.images.logo)
      : null,
    teamImg: input.images.team.length
      ? serializeImagePaths(input.images.team)
      : null,
    productImg: input.images.product.length
      ? serializeImagePaths(input.images.product)
      : null,
    date: new Date().toISOString(),
    status: false,
  };

  const { error: projectError } = await supabase
    .from("project")
    .insert(projectRow);

  if (projectError) {
    console.error("[inscrever] project insert:", projectError);
    await removeUploaded(supabase, allPaths);
    return { error: "Não foi possível registrar o projeto. Tente novamente." };
  }

  const members: MemberInsert[] = [
    ...input.leaders.map((leader) => ({
      name: JSON.stringify([leader.name]),
      contact: leader.contact,
      isFounder: leader.isFounder,
      isLeader: true,
      projectUUID: input.projectUUID,
    })),
    ...(input.commonMembers.length > 0
      ? [
          {
            name: JSON.stringify(input.commonMembers),
            contact: null,
            isFounder: null,
            isLeader: false,
            projectUUID: input.projectUUID,
          },
        ]
      : []),
  ];

  const { error: memberError } = await supabase.from("member").insert(members);

  if (memberError) {
    console.error("[inscrever] member insert:", memberError);
    // Roll back so we never leave a project without its members.
    await supabase.from("project").delete().eq("projectUUID", input.projectUUID);
    await removeUploaded(supabase, allPaths);
    return { error: "Não foi possível registrar os membros. Tente novamente." };
  }

  revalidatePath("/projetos");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { filesFromForm, uploadProjectImages } from "@/lib/inscrever/upload";
import { serializeImagePaths } from "@/lib/media";
import { removeObjects } from "@/lib/storage";
import type { MemberInsert, ProjectInsert } from "@/lib/types/database";
import { submitProjectSchema } from "@/lib/validations/inscrever";

export interface SubmitResult {
  success?: boolean;
  error?: string;
}

async function removeUploaded(paths: string[]) {
  if (paths.length === 0) return;
  try {
    await removeObjects(paths);
  } catch (error) {
    console.error("[inscrever] storage cleanup:", error);
  }
}

/**
 * Registers a project, its images, and members in one server-owned flow:
 * 1. insert the project (status = false, awaiting admin approval)
 * 2. insert the members
 * On any failure everything is rolled back (project row + uploaded images).
 */
export async function submitProjectAction(
  form: FormData
): Promise<SubmitResult> {
  const payload = form.get("payload");
  let data: unknown;
  try {
    data = typeof payload === "string" ? JSON.parse(payload) : null;
  } catch {
    return { error: "Dados inválidos." };
  }
  const parsed = submitProjectSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: "Dados inválidos. Verifique o formulário e tente novamente.",
    };
  }

  const input = parsed.data;
  let files: ReturnType<typeof filesFromForm>;
  try {
    files = filesFromForm(form);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Imagens inválidas.",
    };
  }

  const db = await getDb();
  const projectUUID = crypto.randomUUID();
  let images: Awaited<ReturnType<typeof uploadProjectImages>>;
  try {
    images = await uploadProjectImages(projectUUID, files);
  } catch (error) {
    console.error("[inscrever] image upload:", error);
    return { error: "Não foi possível enviar as imagens. Tente novamente." };
  }
  const allPaths = [...images.logo, ...images.team, ...images.product];

  const projectRow: ProjectInsert = {
    projectUUID,
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
    logoImg: serializeImagePaths(images.logo),
    teamImg: serializeImagePaths(images.team),
    productImg: serializeImagePaths(images.product),
    date: new Date().toISOString(),
    status: false,
  };

  try {
    await db.insert(schema.project).values(projectRow);
  } catch (error) {
    console.error("[inscrever] project insert:", error);
    await removeUploaded(allPaths);
    return { error: "Não foi possível registrar o projeto. Tente novamente." };
  }

  const members: MemberInsert[] = [
    ...input.leaders.map((leader) => ({
      name: JSON.stringify([leader.name]),
      contact: leader.contact,
      isFounder: leader.isFounder,
      isLeader: true,
      projectUUID,
    })),
    ...(input.commonMembers.length > 0
      ? [
          {
            name: JSON.stringify(input.commonMembers),
            contact: null,
            isFounder: null,
            isLeader: false,
            projectUUID,
          },
        ]
      : []),
  ];

  try {
    await db.insert(schema.member).values(members);
  } catch (error) {
    console.error("[inscrever] member insert:", error);
    // Roll back so we never leave a project without its members.
    await db
      .delete(schema.project)
      .where(eq(schema.project.projectUUID, projectUUID));
    await removeUploaded(allPaths);
    return { error: "Não foi possível registrar os membros. Tente novamente." };
  }

  revalidatePath("/projetos");
  return { success: true };
}

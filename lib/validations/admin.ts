import { z } from "zod";

export const projectUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter mais de 2 caracteres.")
    .max(50, "O nome deve ter menos de 50 caracteres."),
  slogan: z.string().trim().max(100, "Máx. 100 caracteres."),
  projectDescription: z.string().trim(),
  targetAudience: z.string().trim(),
  productDescription: z.string().trim(),
  projectViability: z.string().trim(),
  link: z.string().trim().max(1000),
  year: z.coerce.number().int().positive(),
  semester: z.coerce.number().int().positive(),
  course: z.coerce.number().int().positive(),
  tech: z.coerce.number().int().positive(),
  industry: z.coerce.number().int().positive(),
  status: z.boolean(),
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

/** Form-facing schema: lookup ids stay strings (for <Select/>). */
export const editProjectFormSchema = z.object({
  name: z.string().trim().min(2, "Mín. 2 caracteres.").max(50, "Máx. 50."),
  slogan: z.string().trim().max(100, "Máx. 100 caracteres."),
  projectDescription: z.string().trim(),
  targetAudience: z.string().trim(),
  productDescription: z.string().trim(),
  projectViability: z.string().trim(),
  link: z.string().trim().max(1000),
  year: z.string().min(1, "Obrigatório"),
  semester: z.string().min(1, "Obrigatório"),
  course: z.string().min(1, "Obrigatório"),
  tech: z.string().min(1, "Obrigatório"),
  industry: z.string().min(1, "Obrigatório"),
  status: z.boolean(),
});

export type EditProjectFormValues = z.infer<typeof editProjectFormSchema>;

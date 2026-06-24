import { z } from "zod";

const looksLikeUrl = (value: string) =>
  /^https?:\/\/\S+$/i.test(value) ||
  /^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value);

export const isValidContact = (value: string) =>
  z.email().safeParse(value).success || /linkedin\./i.test(value);

export const step1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter mais de 2 caracteres.")
    .max(50, "O nome deve ter menos de 50 caracteres."),
  slogan: z
    .string()
    .trim()
    .min(10, "O slogan deve ter mais de 10 caracteres.")
    .max(100, "O slogan deve ter menos de 100 caracteres."),
  projectDescription: z
    .string()
    .trim()
    .min(10, "A descrição deve ter mais de 10 caracteres.")
    .max(1000, "A descrição deve ter menos de 1000 caracteres."),
  targetAudience: z
    .string()
    .trim()
    .min(10, "A descrição do público-alvo deve ter mais de 10 caracteres.")
    .max(500, "A descrição do público-alvo deve ter menos de 500 caracteres."),
  productDescription: z
    .string()
    .trim()
    .min(10, "A descrição do produto deve ter mais de 10 caracteres.")
    .max(1000, "A descrição do produto deve ter menos de 1000 caracteres."),
  projectViability: z
    .string()
    .trim()
    .min(10, "A descrição da viabilidade deve ter mais de 10 caracteres.")
    .max(1000, "A descrição da viabilidade deve ter menos de 1000 caracteres."),
  link: z
    .string()
    .trim()
    .max(1000, "O link deve ter menos de 1000 caracteres.")
    .refine(
      (v) => v === "" || looksLikeUrl(v),
      "Por favor, insira um link válido."
    ),
});

export const step2Schema = z.object({
  year: z.string().min(1, "Ano requerido"),
  semester: z.string().min(1, "Período requerido"),
  course: z.string().min(1, "Curso requerido"),
  tech: z.string().min(1, "Tecnologia requerida"),
  industry: z.string().min(1, "Industria requerida"),
});

export const leaderSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  contact: z
    .string()
    .trim()
    .min(1, "Contato é obrigatório")
    .refine(
      isValidContact,
      "Contato inválido, insira um e-mail válido ou um link do LinkedIn"
    ),
  isFounder: z.boolean(),
});

export const submitProjectSchema = z.object({
  projectUUID: z.uuid(),
  name: z.string().trim().min(2).max(50),
  slogan: z.string().trim().min(1).max(100),
  projectDescription: z.string().trim().min(1),
  targetAudience: z.string().trim().min(1),
  productDescription: z.string().trim().min(1),
  projectViability: z.string().trim().min(1),
  link: z.string().trim().max(1000).optional().default(""),
  year: z.coerce.number().int().positive(),
  semester: z.coerce.number().int().positive(),
  course: z.coerce.number().int().positive(),
  tech: z.coerce.number().int().positive(),
  industry: z.coerce.number().int().positive(),
  images: z.object({
    logo: z.array(z.string()).min(1),
    team: z.array(z.string()).min(1),
    product: z.array(z.string()).min(1),
  }),
  leaders: z.array(leaderSchema).min(1, "Pelo menos um fundador é necessário"),
  commonMembers: z.array(z.string()),
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;

// ---- File validation (used by the visual-resources step) ----

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const FILE_NAME_REGEX = /^[a-zA-Z0-9_\-.]+$/;

export function validateImageFile(file: File): string | null {
  if (file.size > FILE_SIZE_LIMIT) {
    return "O arquivo deve ter menos de 10MB.";
  }
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return "Formato não suportado. Apenas JPEG, PNG e WebP.";
  }
  const fileName = file.name.split("/").pop() ?? file.name;
  if (!FILE_NAME_REGEX.test(fileName)) {
    return "O nome do arquivo não deve conter caracteres especiais.";
  }
  return null;
}

export function isSquareImage(file: File): Promise<boolean> {
  if (file.type.includes("svg")) return Promise.resolve(true);
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width === img.height);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

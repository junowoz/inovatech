import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "A senha é requerida"),
});

export const passwordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirm: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;

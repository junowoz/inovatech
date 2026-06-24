"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, passwordSchema } from "@/lib/validations/auth";

export interface AuthState {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("invalid") || message.includes("credentials")) {
      return { error: "Senha ou email incorretos." };
    }
    if (message.includes("not confirmed") || message.includes("confirm")) {
      return { error: "Email ainda não confirmado." };
    }
    return { error: error.message };
  }

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        password: fieldErrors.password?.[0],
        confirm: fieldErrors.confirm?.[0],
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

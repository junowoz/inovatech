"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { loginSchema, passwordSchema } from "@/lib/validations/auth";

export interface AuthState {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;

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

  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.adminUser)
    .where(eq(schema.adminUser.email, parsed.data.email.toLowerCase()))
    .limit(1);
  const user = rows[0];
  const now = Date.now();
  const attempts = user
    ? (
        await db
          .select()
          .from(schema.loginAttempt)
          .where(eq(schema.loginAttempt.adminUserId, user.id))
          .limit(1)
      )[0]
    : null;
  const activeWindow = Boolean(
    attempts && now - attempts.windowStart.getTime() < LOGIN_WINDOW_MS
  );

  if (activeWindow && attempts && attempts.failures >= MAX_LOGIN_FAILURES) {
    return { error: "Senha ou email incorretos." };
  }

  const valid = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !valid) {
    if (user) {
      if (activeWindow) {
        await db
          .update(schema.loginAttempt)
          .set({ failures: sql`${schema.loginAttempt.failures} + 1` })
          .where(eq(schema.loginAttempt.adminUserId, user.id));
      } else {
        await db
          .insert(schema.loginAttempt)
          .values({
            adminUserId: user.id,
            failures: 1,
            windowStart: new Date(now),
          })
          .onConflictDoUpdate({
            target: schema.loginAttempt.adminUserId,
            set: { failures: 1, windowStart: new Date(now) },
          });
      }
    }
    return { error: "Senha ou email incorretos." };
  }

  await db
    .delete(schema.loginAttempt)
    .where(eq(schema.loginAttempt.adminUserId, user.id));
  await createSession(user.id);

  const requestedRedirect = formData.get("redirect");
  const redirectTo =
    requestedRedirect === "/dashboard/alterar-senha"
      ? requestedRedirect
      : "/dashboard";
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signOutAction() {
  await destroySession();
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

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const db = await getDb();
  const passwordHash = await hashPassword(parsed.data.password);
  await db
    .update(schema.adminUser)
    .set({ passwordHash })
    .where(eq(schema.adminUser.id, user.id));

  await db
    .delete(schema.adminSession)
    .where(eq(schema.adminSession.adminUserId, user.id));
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

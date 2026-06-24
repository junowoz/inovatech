"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { signInAction, type AuthState } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const justReset = searchParams.get("reset");

  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Painel Admin</CardTitle>
        <CardDescription>Entre para gerenciar os projetos.</CardDescription>
      </CardHeader>
      <CardContent>
        {justReset ? (
          <Alert className="mb-4">
            <AlertDescription>
              Senha alterada com sucesso. Entre novamente.
            </AlertDescription>
          </Alert>
        ) : null}

        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Digite seu email"
              autoComplete="email"
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            {state.fieldErrors?.email && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(state.fieldErrors?.password)}
            />
            {state.fieldErrors?.password && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.password}
              </p>
            )}
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

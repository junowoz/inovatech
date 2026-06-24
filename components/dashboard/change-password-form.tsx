"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { updatePasswordAction } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmChange = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("password", password);
      formData.set("confirm", confirm);
      const result = await updatePasswordAction({}, formData);
      if (result?.error) setError(result.error);
      // On success the action signs out and redirects to /login.
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Alterar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Digite a nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Confirme a nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Alterar senha
            </Button>
          </div>
        </form>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
            <DialogDescription>
              Você realmente deseja alterar a senha? Você precisará entrar
              novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmChange}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

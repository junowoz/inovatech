"use client";

import Link from "next/link";
import {
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  displayName,
  isAdmin,
}: {
  displayName: string | null;
  isAdmin: boolean;
}) {
  if (!displayName) {
    return (
      <Button asChild variant="ghost" size="sm" className="text-primary">
        <Link href="/login">
          <UserCircle className="size-4" />
          Entrar
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <UserCircle className="size-4" />
          {displayName}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Painel admin
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/alterar-senha">
                <KeyRound className="size-4" />
                Alterar senha
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut className="size-4" />
              Encerrar sessão
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

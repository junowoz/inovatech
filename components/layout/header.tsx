"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header({
  user,
}: {
  user: { displayName: string | null; isAdmin: boolean } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label={SITE.name} className="flex items-center">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={48}
            height={48}
            priority
            className="size-12"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActivePath(pathname, item.href) && "text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden md:block">
            <UserMenu
              displayName={user?.displayName ?? null}
              isAdmin={user?.isAdmin ?? false}
            />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {MAIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActivePath(pathname, item.href) && "text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-2 border-t border-border px-4 pt-4">
                <UserMenu
                  displayName={user?.displayName ?? null}
                  isAdmin={user?.isAdmin ?? false}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

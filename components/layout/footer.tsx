import Image from "next/image";
import Link from "next/link";
import { AppWindow, Link2 } from "lucide-react";

import { InstagramIcon } from "@/components/icons";
import { CONTACT, FOOTER_NAV, SITE } from "@/lib/constants";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        {title}
      </h2>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

const externalProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function Footer() {
  const year = new Date().getFullYear();
  const hasContact = CONTACT.emailHref || CONTACT.whatsapp || CONTACT.address;

  return (
    <footer className="border-t border-border bg-secondary/40 text-muted-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[auto_1fr]">
        <Link href="/" aria-label={SITE.name} className="block">
          <Image
            src={SITE.wordmark}
            alt={SITE.name}
            width={220}
            height={132}
            className="h-auto w-44"
          />
        </Link>

        <div className="grid gap-8 sm:grid-cols-3">
          <FooterColumn title="Navegação">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {hasContact ? (
            <FooterColumn title="Contato">
              {CONTACT.emailHref ? (
                <li>
                  <a
                    href={CONTACT.emailHref}
                    className="transition-colors hover:text-foreground"
                  >
                    Email
                  </a>
                </li>
              ) : null}
              {CONTACT.whatsapp ? (
                <li>
                  <a
                    href={CONTACT.whatsapp}
                    {...externalProps}
                    className="transition-colors hover:text-foreground"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {CONTACT.address ? (
                <li>
                  <a
                    href={CONTACT.address}
                    {...externalProps}
                    className="transition-colors hover:text-foreground"
                  >
                    Endereço
                  </a>
                </li>
              ) : null}
            </FooterColumn>
          ) : null}

          <FooterColumn title="Redes e Sites">
            <li className="flex items-center gap-4 pt-1">
              <a
                href={CONTACT.instagram}
                {...externalProps}
                aria-label="Instagram"
                className="transition-colors hover:text-foreground"
              >
                <InstagramIcon className="size-6" />
              </a>
              <a
                href={CONTACT.fametro}
                {...externalProps}
                aria-label="Site da Fametro"
                className="transition-colors hover:text-foreground"
              >
                <AppWindow className="size-6" />
              </a>
              <a
                href={CONTACT.flowcode}
                {...externalProps}
                aria-label="Flowcode"
                className="transition-colors hover:text-foreground"
              >
                <Link2 className="size-6" />
              </a>
            </li>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            Designed and developed by{" "}
            <a
              href={SITE.author.url}
              {...externalProps}
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              {SITE.author.name}
            </a>
          </p>
          <p className="tabular-nums">
            © {year} {SITE.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

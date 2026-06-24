import type { Metadata, Viewport } from "next";
import { Karla } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@/components/providers/analytics";
import { SITE } from "@/lib/constants";

import "./globals.css";

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Feira de Inovação`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  creator: SITE.author.name,
  keywords: [
    "Inovatech",
    "Fametro",
    "empreendedorismo",
    "tecnologia",
    "computação",
    "feira de inovação",
    "projetos",
  ],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} | Feira de Inovação`,
    description: SITE.description,
    images: [{ url: SITE.wordmark, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Feira de Inovação`,
    description: SITE.description,
    images: [SITE.wordmark],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: SITE.logo,
    apple: SITE.logo,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#095BA6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${karla.variable} antialiased`}>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}

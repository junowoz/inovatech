export const SITE = {
  name: "Inovatech",
  title: "Inovatech",
  description:
    "O Inovatech é uma iniciativa de empreendedorismo tecnológico formada por alunos e professores dos cursos de Computação da Fametro.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://inovatech.junowoz.com",
  locale: "pt_BR",
  logo: "/symbol-inovatech.svg",
  wordmark: "/inovatech.svg",
  author: { name: "@junowoz", url: "https://junowoz.com" },
} as const;

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export const CONTACT = {
  email: contactEmail,
  emailHref: contactEmail ? `mailto:${contactEmail}` : "",
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP_URL ?? "",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS_URL ?? "",
  instagram: "https://www.instagram.com/computacaofametro/",
  fametro: "https://fametro.edu.br/",
  flowcode: "https://www.flowcode.com/page/computacaofametro",
} as const;

export const MAIN_NAV = [
  { label: "Início", href: "/" },
  { label: "Projetos", href: "/projetos" },
  { label: "Inscrever", href: "/inscrever" },
] as const;

export const FOOTER_NAV = [
  { label: "Projetos", href: "/projetos" },
  { label: "Inscrever", href: "/inscrever" },
  { label: "Manual", href: "/manual" },
] as const;

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

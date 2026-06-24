# Inovatech

O **Inovatech** é uma iniciativa de empreendedorismo tecnológico formada por
alunos e professores dos cursos de Computação da Fametro. Esta é a plataforma
web que reúne os projetos apresentados, com inscrição de novos projetos,
diretório navegável e painel administrativo.

Site: [inovatech.junowoz.com](https://inovatech.junowoz.com) · Desenvolvimento e
design: [@junowoz](https://junowoz.com)

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives, lucide icons)
- **Supabase** (`@supabase/ssr`) — Postgres + Storage + Auth
- **Zod** + **react-hook-form** — validação de formulários
- **Zustand** — estado do wizard de inscrição (client)

## Como rodar

```bash
pnpm install
cp .env.example .env.local   # preencha as variáveis do Supabase
pnpm dev                     # http://localhost:3000
```

### Variáveis de ambiente

Veja [.env.example](.env.example). As principais:

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon (pública) |
| `NEXT_PUBLIC_MIDIA_URL` | Base pública do bucket `midia` |
| `NEXT_PUBLIC_SITE_URL` | URL canônica (SEO / sitemap) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (opcional) |
| `NEXT_PUBLIC_FILES_URL` | Base de arquivos do Manual (opcional) |

## Scripts

| Script | Ação |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm start` | Servir o build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` | Prettier |

## Arquitetura

A documentação completa de arquitetura, convenções e regras do projeto está em
[AGENTS.md](AGENTS.md) (com symlink em `CLAUDE.md`). Resumo:

- `app/` — rotas (App Router). Grupo `(main)` carrega Header/Footer; `login` usa
  layout próprio.
- `app/actions/` — Server Actions (auth, inscrição, admin).
- `components/` — `ui/` (shadcn) + componentes por domínio.
- `lib/` — `supabase/` (clients + queries), `stores/`, `validations/` (zod),
  `types/` e utilitários.
- `proxy.ts` — refresh da sessão Supabase e proteção de `/dashboard`.

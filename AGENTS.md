# AGENTS.md — Inovatech

Guia de arquitetura, convenções e regras para agentes (e humanos) trabalharem
neste projeto. Leia antes de editar. `CLAUDE.md` é um symlink para este arquivo.

## 1. O que é

Plataforma web do **Inovatech** — iniciativa de empreendedorismo tecnológico dos
cursos de Computação da Fametro. Funcionalidades:

- **Home** (`/`) — hero + busca de projetos.
- **Projetos** (`/projetos`, `/projetos/[slug]`) — diretório público com filtros
  e página de detalhe. O `slug` é o **nome** do projeto.
- **Inscrever** (`/inscrever` → `um` → `dois` → `tres` → `finalizar`) — wizard de
  4 passos para submeter um projeto (fica `status: false` até aprovação).
- **Admin** (`/login`, `/dashboard`, `/dashboard/alterar-senha`) — CRUD de
  projetos, protegido por sessão Supabase.
- **Manual** (`/manual`) e **Rank** (`/rank`).

## 2. Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict).
- Tailwind CSS v4 (config em CSS, sem `tailwind.config`) + shadcn/ui (estilo
  `new-york`, primitives via pacote unificado `radix-ui`, ícones `lucide-react`).
- Supabase via `@supabase/ssr` (browser/server/proxy clients).
- Forms: `react-hook-form` + `zod` (`@hookform/resolvers/zod`).
- Estado client: `zustand` (apenas o wizard de inscrição).
- Toasts: `sonner`. Gerenciador: **pnpm**.

## 3. Estrutura

```
app/
  layout.tsx              raiz: fonte Karla, metadata base, Toaster, TooltipProvider
  globals.css             tokens de design (Tailwind v4 @theme)
  sitemap.ts robots.ts manifest.ts not-found.tsx
  actions/                Server Actions: auth.ts, inscrever.ts, admin.ts
  (main)/                 grupo com Header + Footer
    layout.tsx            busca o user (server) e passa pro Header
    page.tsx              Home
    projetos/ inscrever/ dashboard/ manual/ rank/
  login/                  layout próprio (sem Header/Footer)
components/
  ui/                     shadcn (NÃO editar à toa; é gerado). Button tem variantes
                          extras: `brand`, `outline-brand`, e prop `static`.
  layout/ home/ projetos/ inscrever/ dashboard/ auth/ manual/
  icons.tsx               InstagramIcon / LinkedinIcon (lucide 1.x removeu brand icons)
lib/
  supabase/               client.ts (browser), server.ts (RSC/actions),
                          middleware.ts (helper de sessão), queries.ts (reads)
  stores/                 inscrever-store.ts (zustand)
  validations/            auth.ts, inscrever.ts, admin.ts (schemas zod)
  types/database.ts       tipos do schema Supabase
  hooks/use-hydrated.ts   gate de hidratação (useSyncExternalStore)
  media.ts members.ts lookups.ts constants.ts utils.ts auth.ts
proxy.ts                  refresh de sessão + proteção de /dashboard (era middleware.ts)
_legacy/                  código antigo (Pages Router) só para referência — EXCLUÍDO
                          de tsconfig/eslint/build. Não importar daqui.
```

## 4. Regras de arquitetura

- **Server Components por padrão.** Use `"use client"` só quando há estado/efeito/
  evento. Páginas com dados buscam via `lib/supabase/queries.ts` no servidor.
- **Mutações = Server Actions** (`app/actions/*`). Nunca escreva no banco a partir
  do client. Toda action de admin chama `getCurrentUser()` antes de mutar e
  `revalidatePath()` depois.
- **Supabase clients:**
  - `lib/supabase/client.ts` → browser (uploads diretos de imagem, leitura client).
  - `lib/supabase/server.ts` → RSC/actions (lê cookies → torna a rota dinâmica).
  - `proxy.ts` → faz refresh do token a cada request.
- **Queries falham suave**: retornam `[]`/`null` em erro, mas **re-lançam** erros
  de controle do Next (`DYNAMIC_SERVER_USAGE`, `NEXT_REDIRECT`, …). Mantenha isso.
- **Auth**: server-side. `requireUser()` protege páginas; `proxy.ts` protege
  `/dashboard/*`. Login/logout/troca de senha são Server Actions em
  `app/actions/auth.ts`.

## 5. Modelo de dados (Supabase)

Tabelas: `project`, `member`, e lookups `year`, `semester`, `course`, `tech`,
`industry` (cada `{ id, name }`). Bucket de storage: `midia`.

**Convenções herdadas (preservar para compatibilidade com dados existentes):**

- `project.logoImg` / `teamImg` / `productImg` são **strings JSON** no formato
  `{"path": string[]}`. Use `serializeImagePaths()` / `parseImagePaths()` /
  `firstImageUrl()` / `imageUrls()` de `lib/media.ts`. Nunca grave array cru.
- `member.name` é um **array** de nomes; pode voltar como array, string JSON ou
  literal de array Postgres — normalize com `parseMemberNames()` (`lib/members.ts`).
- `project.status` (boolean) = publicado. Lookups (`year`/`tech`/…) são ids
  numéricos resolvidos para nome com `lookupName()` (`lib/lookups.ts`).
- Caminhos no storage: `logo|team|product/{projectUUID}/{uuid}-{filename}`.

Inscrição (em `app/actions/inscrever.ts`): upload das imagens é **client-side**
(`lib/inscrever/upload.ts`); a action insere `project` e depois `member` de forma
transacional — se os membros falharem, faz rollback do projeto e remove os uploads.

> RLS: o app valida auth na camada de Server Action, mas habilite **RLS** nas
> tabelas/bucket no Supabase para segurança real (a anon key é pública).

## 6. Design (obrigatório)

Siga as diretrizes em [`design/SKILL.md`](design/SKILL.md) e `design/references/*`.
O visual da marca é preservado 1:1. Pontos aplicados neste repo:

- Cores (tokens em `app/globals.css`), padrão Fametro: primário `#095BA6` (azul),
  accent/CTA `#E42528` (vermelho, `brand-accent`), títulos `#062b4c` (`brand-ink`),
  hero `#e7eef6`. Fonte **Karla**.
- Raio concêntrico, sombras em vez de bordas (`shadow-border` / `shadow-border-hover`),
  `active:scale-[0.96]` nos botões (prop `static` desliga), `text-balance` em
  títulos e `text-pretty` em parágrafos, `tabular-nums` em números dinâmicos,
  `.img-outline` (preto/branco puro) só em fotos de conteúdo — nunca em logos.
- Nunca `transition: all`; especifique as propriedades. `will-change` só se houver
  stutter real.

## 7. Convenções de código

- TypeScript estrito; sem `any` desnecessário. Tipos do banco em `lib/types`.
- Para ler o store persistido (zustand) sem hydration mismatch, use
  `useHydrated()` + lazy `useState(() => store.getState()...)`. **Não** chame
  `setState` síncrono dentro de `useEffect` (regra `react-hooks/set-state-in-effect`).
- `<Select>` (shadcn) usa value `string`; schemas de form usam strings para ids e
  o servidor coage para número (`z.coerce.number()`).
- Imagens remotas: `components/projetos/project-image.tsx` (next/image + fallback).
  Hosts permitidos vêm de `NEXT_PUBLIC_SUPABASE_URL` em `next.config.ts`.

## 8. Gotchas

- **Next 16**: arquivo de middleware chama-se `proxy.ts` (export `proxy`). `next lint`
  foi removido — `pnpm lint` roda `eslint .` (flat config nativo do `eslint-config-next`).
- **lucide-react 1.x** não tem ícones de marca (Instagram/LinkedIn/GitHub) — use
  `components/icons.tsx`.
- Tipos do Supabase devem ser `type` (não `interface`) para satisfazer
  `Record<string, unknown>` nos genéricos do client.
- O arquivo `pacote-inovatec.zip` é um identificador real — **não** renomeie para
  "inovatech". Dados de contato reais devem vir de variáveis `NEXT_PUBLIC_CONTACT_*`.

## 9. Comandos

```bash
pnpm dev | build | start
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint .
pnpm format         # prettier
pnpm dlx shadcn@latest add <comp>   # adicionar componente shadcn
```

Antes de finalizar qualquer mudança: `pnpm typecheck && pnpm lint && pnpm build`.

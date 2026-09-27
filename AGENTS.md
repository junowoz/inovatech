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
  projetos, protegido por sessão em cookie (D1).
- **Manual** (`/manual`) e **Rank** (`/rank`).

## 2. Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict).
- Tailwind CSS v4 (config em CSS, sem `tailwind.config`) + shadcn/ui (estilo
  `new-york`, primitives via pacote unificado `radix-ui`, ícones `lucide-react`).
- **Cloudflare Workers** via `@opennextjs/cloudflare` · **D1** (SQLite) via
  **Drizzle ORM** · **R2** (bucket compartilhado `junowoz-bucket`) para mídia.
- Auth própria (cookie de sessão + D1), sem provedor terceiro — ver §5.
- Forms: `react-hook-form` + `zod` (`@hookform/resolvers/zod`).
- Estado client: `zustand` (apenas o wizard de inscrição).
- Toasts: `sonner`. Gerenciador: **pnpm**.

## 3. Estrutura

```
app/
  layout.tsx              raiz: fonte Karla, metadata base, Toaster, TooltipProvider
  globals.css              tokens de design (Tailwind v4 @theme)
  sitemap.ts robots.ts manifest.ts not-found.tsx
  midia/[...path]/         route handler que serve objetos do R2 (GET)
  actions/                 Server Actions: auth.ts, inscrever.ts, admin.ts
  (main)/                  grupo com Header + Footer
    layout.tsx             busca o user (server) e passa pro Header
    page.tsx                Home
    projetos/ inscrever/ dashboard/ manual/ rank/
  login/                   layout próprio (sem Header/Footer)
components/
  ui/                      shadcn (NÃO editar à toa; é gerado). Button tem variantes
                           extras: `brand`, `outline-brand`, e prop `static`.
  layout/ home/ projetos/ inscrever/ dashboard/ auth/ manual/
  icons.tsx                InstagramIcon / LinkedinIcon (lucide 1.x removeu brand icons)
lib/
  db/                      schema.ts (Drizzle/D1), index.ts (getDb/getEnv),
                           queries.ts (reads)
  auth/                    password.ts (PBKDF2), session.ts (cookie + D1),
                           constants.ts (nome do cookie, sem deps de server)
  storage.ts               R2 (put/get/remove), prefixo `inovatech/`
  stores/                  inscrever-store.ts (zustand)
  validations/             auth.ts, inscrever.ts, admin.ts (schemas zod)
  types/database.ts        Row types do schema D1 (espelham lib/db/schema.ts)
  hooks/use-hydrated.ts    gate de hidratação (useSyncExternalStore)
  media.ts members.ts lookups.ts constants.ts utils.ts auth.ts
proxy.ts                   checa cookie de sessão + proteção de /dashboard
drizzle/                   migrations SQL geradas (`pnpm db:generate`)
_legacy/                   código antigo (Pages Router) só para referência — EXCLUÍDO
                           de tsconfig/eslint/build. Não importar daqui.
```

## 4. Regras de arquitetura

- **Server Components por padrão.** Use `"use client"` só quando há estado/efeito/
  evento. Páginas com dados buscam via `lib/db/queries.ts` no servidor.
- **Mutações = Server Actions** (`app/actions/*`). Nunca escreva no banco a partir
  do client. Toda action de admin chama `isCurrentUserAdmin()`/`requireAdmin()`
  antes de mutar e `revalidatePath()` depois.
- **D1 (via Drizzle):**
  - `lib/db/index.ts` → `getDb()` (instância Drizzle, cacheada por binding) e
    `getEnv()` (acesso cru ao `CloudflareEnv`), ambos via
    `getCloudflareContext()` (`@opennextjs/cloudflare`).
  - `lib/db/schema.ts` → única fonte de verdade do schema; `lib/types/database.ts`
    espelha os shapes de leitura/escrita usados pelo app.
  - Em `next dev`, o binding `DB` vem do `wrangler.jsonc` via miniflare
    (`initOpenNextCloudflareForDev()` em `next.config.ts`) — mesmo código em
    dev e produção.
- **R2 (mídia):** `lib/storage.ts` (`putObject`/`getObject`/`removeObjects`,
  binding `BUCKET`, prefixo `inovatech/`). Objetos são servidos publicamente
  via `app/midia/[...path]/route.ts` (não há URL pública direta do bucket —
  evita depender de domínio customizado no R2).
- **Queries falham suave**: retornam `[]`/`null` em erro e logam no console.
- **Auth**: cookie de sessão HttpOnly (`lib/auth/session.ts`), sessão validada
  contra D1 a cada leitura privilegiada. `requireUser()`/`requireAdmin()`
  (`lib/auth.ts`) protegem páginas e actions; `proxy.ts` só checa a
  *presença* do cookie (`/dashboard/*`) — barato, roda no edge, sem tocar D1.
  Login/logout/troca de senha são Server Actions em `app/actions/auth.ts`.

## 5. Modelo de dados (D1 / Drizzle)

Tabelas: `project`, `member`, lookups `year`, `semester`, `course`, `tech`,
  `industry` (cada `{ id, name }`), e auth própria: `adminUser` (toda linha é um
  admin — substitui a allowlist `admins` do Supabase), `adminSession` e
  `loginAttempt` (limite de tentativas por conta). Mídia:
prefixo R2 `inovatech/` (substitui o bucket Supabase `midia`).

**Convenções herdadas (preservar para compatibilidade com dados existentes,
migrados do Supabase — ver README §"Migração de dados"):**

- `project.logoImg` / `teamImg` / `productImg` são **strings JSON** no formato
  `{"path": string[]}`. Use `serializeImagePaths()` / `parseImagePaths()` /
  `firstImageUrl()` / `imageUrls()` de `lib/media.ts`. Nunca grave array cru.
- `member.name` é armazenado como **string JSON** de um array de nomes (pode
  também chegar como array real ou literal `{a,b}` em dados legados);
  normalize com `parseMemberNames()` (`lib/members.ts`).
- `project.status` (boolean) = publicado. Lookups (`year`/`tech`/…) são ids
  numéricos resolvidos para nome com `lookupName()` (`lib/lookups.ts`).
- Caminhos no storage: `logo|team|product/{projectUUID}/{uuid}-{filename}`.

Inscrição (em `app/actions/inscrever.ts`): uma única Server Action recebe dados
e imagens via `FormData`, gera o UUID e os caminhos no servidor, valida as
imagens e escreve no R2 pelo binding. `lib/inscrever/upload.ts` é helper
interno, não uma action pública. A action insere `project` e depois `member`;
se os membros falharem, faz limpeza compensatória do projeto e dos uploads.

> Autenticação e autorização são checadas na camada de Server Action/D1 —
> não há RLS (SQLite/D1 não tem). Nenhuma query roda com credencial pública;
> tudo passa pelo binding do Worker.

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
  Servidas same-origin via `/midia/...` (`next.config.ts` usa `images.unoptimized`
  — Workers não tem otimizador de imagem — então não há `remotePatterns`).

## 8. Gotchas

- **Next 16**: arquivo de middleware chama-se `proxy.ts` (export `proxy`). `next lint`
  foi removido — `pnpm lint` roda `eslint .` (flat config nativo do `eslint-config-next`).
- **lucide-react 1.x** não tem ícones de marca (Instagram/LinkedIn/GitHub) — use
  `components/icons.tsx`.
- Tipos do D1 devem ser `type` (não `interface`) para satisfazer os genéricos
  do Drizzle onde aplicável.
- `wrangler.jsonc` aponta para a D1 `inovatech` da conta Cloudflare Juno Woz.
  Não substitua o ID por uma database de outra conta ou ambiente.
- O arquivo `pacote-inovatec.zip` é um identificador real — **não** renomeie para
  "inovatech". Deve existir em `public/files/pacote-inovatec.zip` (não é mais
  servido de um bucket externo). Dados de contato reais vêm de variáveis
  `NEXT_PUBLIC_CONTACT_*`.
- **Nunca** rode `wrangler deploy`/`pnpm deploy` localmente — os scripts
  `deploy`/`upload` falham de propósito. Deploy é só via Cloudflare Workers
  Builds (`git push main`).

## 9. Comandos

```bash
pnpm dev | build | start
pnpm typecheck              # tsc --noEmit
pnpm lint                   # eslint .
pnpm format                 # prettier
pnpm db:generate            # gera migrations Drizzle a partir do schema
pnpm db:migrate:local       # aplica migrations no D1 local (miniflare)
pnpm db:migrate:remote      # aplica migrations no D1 de produção
pnpm db:seed:local          # lookups + admin de dev no D1 local
pnpm dlx shadcn@latest add <comp>   # adicionar componente shadcn
```

Antes de finalizar qualquer mudança: `pnpm typecheck && pnpm lint && pnpm build`.

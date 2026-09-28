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
- **Cloudflare Workers** (via `@opennextjs/cloudflare`) · **D1** (SQLite, via
  Drizzle ORM) · **R2** (media storage, shared `junowoz-bucket`)
- Auth: cookie-based sessions backed by D1 (`lib/auth/*`), no third-party
  auth provider
- **Zod** + **react-hook-form** — validação de formulários
- **Zustand** — estado do wizard de inscrição (client)

## Como rodar

```bash
pnpm install
cp .env.example .env
pnpm db:migrate:local        # cria o schema no D1 local (miniflare)
pnpm db:seed:local           # lookups + um admin de dev (ver saída do comando)
pnpm dev                     # http://localhost:3000
```

Bindings do Cloudflare (D1 `DB`, R2 `BUCKET`) vêm de `wrangler.jsonc` via
miniflare — `next dev` já lê o D1/R2 local automaticamente
(`initOpenNextCloudflareForDev()` em `next.config.ts`). Tudo roda 100% local,
sem depender de nenhum recurso cloud.

### Variáveis de ambiente

Veja [.env.example](.env.example). As principais:

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canônica (SEO / sitemap) |
| `NEXT_PUBLIC_MIDIA_URL` | Base do endpoint `/midia` que serve os objetos do R2 (`/midia/` em todo ambiente) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail público (`inbox@junowoz.com`) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (opcional) |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_D1_DATABASE_ID` / `CLOUDFLARE_D1_TOKEN` | Opcionais, só para `drizzle-kit studio` contra o D1 remoto |

## Banco de dados (D1 / Drizzle)

- Schema: [`lib/db/schema.ts`](lib/db/schema.ts).
- `pnpm db:generate` — gera migrations SQL em `./drizzle` a partir do schema.
- `pnpm db:migrate:local` — aplica as migrations no D1 local (miniflare).
- `pnpm db:migrate:remote` — aplica futuras migrations no D1 de produção com o
  `cf` oficial e a credencial de operador ativa.
- `pnpm db:studio` — abre o Drizzle Studio contra o D1 remoto (usa as
  `CLOUDFLARE_*` env vars).

## Deploy

Este app só é publicado via **Cloudflare Workers Builds** (`git push main`) —
os scripts `deploy`/`upload` locais falham de propósito. Não faça deploy local.
Na conta Cloudflare **Juno Woz**, conecte o repositório ao Workers Builds,
configure a branch de produção `main`, o comando de build
`pnpm install --frozen-lockfile && pnpm exec opennextjs-cloudflare build` e o
comando de deploy `pnpm exec wrangler deploy`. O Worker usa o domínio
`inovatech.junowoz.com` declarado em `wrangler.jsonc`.
Faça a conexão após o commit e push desta migração: a etapa **Save and Deploy**
da importação do repositório inicia a primeira publicação.

Os recursos de dados de produção já estão preparados na conta **Juno Woz**:

- D1 `inovatech`, ID `7fd3a010-24e1-4692-be15-34932aedbb6e`, ligado como
  `DB` em `wrangler.jsonc`. As migrations `0000` e `0001` foram aplicadas.
- R2 compartilhado `junowoz-bucket`, ligado como `BUCKET`; os objetos desta
  aplicação ficam somente sob `inovatech/`.
- Os valores públicos de produção têm defaults no código e constam em
  `wrangler.jsonc`: URL `https://inovatech.junowoz.com`, mídia `/midia/` e
  contato `inbox@junowoz.com`. Se forem alterados, atualize também as variáveis
  `NEXT_PUBLIC_*` em **Workers Builds → Settings → Build → Build variables and
  secrets** antes de publicar, porque o Next.js as incorpora ao bundle durante
  o build. As `vars` do Wrangler só chegam ao runtime do Worker.
- Defina `PNPM_VERSION=10.33.2` no ambiente de build para coincidir com o
  `packageManager` do projeto. `NEXT_PUBLIC_GA_ID` é opcional.

### Migração de dados (Supabase → D1/R2)

O export privado foi preparado em 27/09/2026, validado em um D1 local isolado e
importado para o D1 remoto:
65 projetos, 250 registros de membros (incluindo 22 sem projeto atual),
49 registros de lookups e um administrador. As 317 imagens do bucket Supabase
`midia` foram copiadas para `junowoz-bucket/inovatech/`; 281 são referenciadas
pelos projetos. A listagem remota confirmou 317 objetos, nenhum caminho extra
ou ausente, tamanhos iguais e MD5/ETag igual para todos. As sete tabelas
migradas foram comparadas campo a campo ao export, sem divergências após a
normalização de um caminho de imagem. O arquivo do bucket
`files` está em `public/files/pacote-inovatec.zip`.
No prefixo `logo/`, são 62 objetos em 62 pastas, exatamente um por pasta.
Os outros 36 objetos sem referência atual estão em `team/` e `product/` e
foram preservados como parte do export completo.

Os exports, SQL de importação, senhas iniciais e imagens baixadas são privados
e ficam **fora do repositório**. `scripts/prepare-supabase-import.mjs` converte
o JSON privado para SQL D1, valida as referências de imagens e gera uma senha
aleatória para o admin. `scripts/upload-r2-media.mjs` valida tamanho e SHA-256
de cada imagem antes de copiá-la pelo Wrangler; seu arquivo de estado permite
retomar uma cópia interrompida. Um nome legado com `..` foi normalizado para
`-.` no R2 e na referência D1, pois a API Cloudflare bloqueou o nome original.
Os dois scripts aplicam a mesma normalização se a migração for refeita.

**Não execute o SQL de importação outra vez no D1 já preenchido.** A senha
inicial do administrador está somente em
`/tmp/inovatech-migration/admin-credentials.json` nesta VPS; coloque-a em um
gerenciador de senhas e altere-a no painel após o primeiro acesso. O Supabase
permanece como origem histórica até conferir o Worker publicado. Revogue as
chaves S3 compartilhadas e troque a senha Postgres expostas no chat após essa
conferência.

## Scripts

| Script | Ação |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção (Next.js) |
| `pnpm start` | Servir o build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` | Prettier |
| `pnpm db:generate` | Gera migrations Drizzle |
| `pnpm db:migrate:local` / `:remote` | Aplica migrations no D1 |
| `pnpm db:seed:local` | Popula lookups + admin de dev no D1 local |
| `pnpm preview:local` | Build OpenNext + preview via Wrangler (roda como Worker localmente) |

## Arquitetura

A documentação completa de arquitetura, convenções e regras do projeto está em
[AGENTS.md](AGENTS.md) (com symlink em `CLAUDE.md`). Resumo:

- `app/` — rotas (App Router). Grupo `(main)` carrega Header/Footer; `login` usa
  layout próprio. `app/midia/[...path]` serve os objetos do R2.
- `app/actions/` — Server Actions (auth, inscrição, admin).
- `components/` — `ui/` (shadcn) + componentes por domínio.
- `lib/` — `db/` (schema Drizzle + client + queries), `auth/` (sessão +
  senha), `storage.ts` (R2), `stores/`, `validations/` (zod), `types/` e
  utilitários.
- `proxy.ts` — checa a presença do cookie de sessão e protege `/dashboard`.

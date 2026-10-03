# portal-admin-web

Painel administrativo dos portais de imóveis. **Next.js 16 (App Router) + React 19 +
TypeScript + Tailwind v4 + shadcn/ui**, consumindo a API Django (`portal-api`).

## Rodar

```bash
npm install
cp .env.example .env.local      # API_BASE_URL=http://localhost:8000/api/v1
npm run dev -- -p 3001          # http://localhost:3001 (o portal público usa a 3000)
```

Qualidade: `npx next typegen && npx tsc --noEmit && npm run lint`.

Usuário inicial: `admin@admin.com` / `Admin@12345` (criado pelo `createuser` no backend,
com o perfil `ADMIN` que o `seedpermissions` gera).

## Autenticação

- Login em `/login` chama `POST /api/v1/auth/login/`. A senha é enviada como **MD5 hex
  maiúsculo** (convenção do backend), gerado no servidor em `lib/auth/session.ts`.
- `access` e `refresh` ficam em cookies **httpOnly** (`admin_access`, `admin_refresh`).
  O `src/proxy.ts` renova o access pelo refresh quando faltam menos de 2 minutos para
  expirar e redireciona para `/login` quando não há sessão.
- O JWT traz `name` e `permissions` (`{view_name: {create, read, update, delete}}`).
  O menu lateral (`src/config/nav.ts`) e as páginas usam `pode(sessao, view_name, acao)`.

## Estrutura

```
src/
├── app/
│   ├── (admin)/          # layout com shell + páginas protegidas
│   ├── login/, sem-permissao/
├── components/
│   ├── ui/               # shadcn
│   ├── layout/           # shell, sidebar, page-header
│   ├── data/             # data-table, toolbar, pagination-bar, row-actions, status-badge
│   └── form/             # campo, select-lookup, form-footer, helpers
├── features/<recurso>/   # types.ts, schemas.ts, actions.ts, *-form.tsx
├── lib/
│   ├── api/              # client (envelope), resources (CRUD genérico), types
│   ├── auth/             # session, actions, usuario-atual
│   └── actions/          # salvarRecurso, excluirRecurso, buscarLookup
├── config/nav.ts         # menu por view_name
└── proxy.ts
```

## Padrão de uma tela CRUD

1. **Lista** (`app/(admin)/<rota>/page.tsx`, Server Component): `requirePermissao(view_name)`,
   `paramsDeBusca(searchParams, [filtros])`, `recurso.listar(path, params)`, `Toolbar`,
   `DataTable` com `RowActions`, `PaginationBar`.
2. **Formulário** (`features/<recurso>/<recurso>-form.tsx`, client): react-hook-form +
   zod, `salvarRecurso(path, id, body, [rotas a revalidar])`, erros da API mapeados com
   `aplicarErros`. Selects de FK usam `SelectLookup` (`GET /<recurso>/lookup/`).
3. **Novo/Editar** (`<rota>/novo/page.tsx`, `<rota>/[id]/page.tsx`): carregam dados no
   servidor e renderizam o formulário.

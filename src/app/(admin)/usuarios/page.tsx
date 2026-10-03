import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UsuarioLista } from "@/features/usuarios/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Usuários" };

export default async function UsuariosPage({ searchParams }: PageProps<"/usuarios">) {
  const sessao = await requirePermissao("user");
  const params = paramsDeBusca(await searchParams, [], { ordering: "-created_at" });
  const pagina = await recurso.listar<UsuarioLista>("users", params);

  return (
    <>
      <PageHeader
        titulo="Usuários"
        descricao="Contas que acessam o painel administrativo."
        crumbs={[{ label: "Usuários" }]}
        acoes={
          pode(sessao, "user", "create") && (
            <Button asChild>
              <Link href="/usuarios/novo"><Plus data-icon="inline-start" /> Novo usuário</Link>
            </Button>
          )
        }
      />
      <Toolbar placeholder="Buscar por nome ou e-mail…" />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (u) => <Link href={`/usuarios/${u.id}`} className="font-medium hover:underline">{u.name || "—"}</Link> },
          { chave: "email", titulo: "E-mail", ordenavel: "email" },
          { chave: "role", titulo: "Papel", render: (u) => <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role === "ADMIN" ? "Administrador" : "Usuário"}</Badge> },
          { chave: "is_active", titulo: "Status", render: (u) => <StatusBadge ativo={u.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (u) => formatarData(u.created_at) },
        ]}
        acoes={(u) => (
          <RowActions
            id={u.id}
            editarHref={`/usuarios/${u.id}`}
            recurso="users"
            rotulo={`o usuário ${u.email}`}
            revalidar={["/usuarios"]}
            podeEditar={pode(sessao, "user", "update")}
            podeExcluir={pode(sessao, "user", "delete") && u.id !== sessao.user_id}
          />
        )}
        vazio={{ titulo: "Nenhum usuário encontrado" }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { PerfilLista } from "@/features/perfis/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Perfis de acesso" };

export default async function PerfisPage({ searchParams }: PageProps<"/perfis">) {
  const sessao = await requirePermissao("profile");
  const params = paramsDeBusca(await searchParams, [], { ordering: "name" });
  const pagina = await recurso.listar<PerfilLista>("profiles", params);

  return (
    <>
      <PageHeader
        titulo="Perfis de acesso"
        descricao="Cada perfil agrupa permissões de ver, criar, editar e excluir por tela."
        crumbs={[{ label: "Perfis de acesso" }]}
        acoes={pode(sessao, "profile", "create") && (
          <Button asChild><Link href="/perfis/novo"><Plus data-icon="inline-start" /> Novo perfil</Link></Button>
        )}
      />
      <Toolbar placeholder="Buscar perfil…" />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (p) => <Link href={`/perfis/${p.id}`} className="font-medium hover:underline">{p.name}</Link> },
          { chave: "is_active", titulo: "Status", render: (p) => <StatusBadge ativo={p.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (p) => formatarData(p.created_at) },
        ]}
        acoes={(p) => (
          <RowActions id={p.id} editarHref={`/perfis/${p.id}`} recurso="profiles" rotulo={`o perfil ${p.name}`} revalidar={["/perfis"]} podeEditar={pode(sessao, "profile", "update")} podeExcluir={pode(sessao, "profile", "delete")} />
        )}
        vazio={{ titulo: "Nenhum perfil cadastrado" }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

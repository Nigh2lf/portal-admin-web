import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FILTRO_STATUS } from "@/features/comum/helpers";
import type { IntegradorLista } from "@/features/integradores/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Integradores" };

export default async function IntegradoresPage({ searchParams }: PageProps<"/integradores">) {
  const sessao = await requirePermissao("integrator");
  const params = paramsDeBusca(await searchParams, ["is_active"], { ordering: "name" });
  const pagina = await recurso.listar<IntegradorLista>("integrators", params);
  const botaoNovo = pode(sessao, "integrator", "create") ? (
    <Button asChild>
      <Link href="/integradores/novo"><Plus data-icon="inline-start" /> Novo integrador</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Integradores" descricao="Sistemas de XML/CRM que alimentam os imóveis dos anunciantes." crumbs={[{ label: "Integradores" }]} acoes={botaoNovo} />
      <Toolbar placeholder="Buscar por nome ou slug…" filtros={[FILTRO_STATUS]} />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (i) => <Link href={`/integradores/${i.id}`} className="font-medium hover:underline">{i.name}</Link> },
          { chave: "slug", titulo: "Slug", ordenavel: "slug", render: (i) => <span className="font-mono text-xs text-muted-foreground">{i.slug}</span> },
          { chave: "is_active", titulo: "Status", render: (i) => <StatusBadge ativo={i.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (i) => formatarData(i.created_at) },
        ]}
        acoes={(i) => (
          <RowActions
            id={i.id}
            editarHref={`/integradores/${i.id}`}
            recurso="integrators"
            rotulo={`o integrador ${i.name}`}
            revalidar={["/integradores"]}
            podeEditar={pode(sessao, "integrator", "update")}
            podeExcluir={pode(sessao, "integrator", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum integrador encontrado", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

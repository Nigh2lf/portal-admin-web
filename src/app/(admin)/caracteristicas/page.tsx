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
import { ESCOPOS, ROTULO_ESCOPO, type CaracteristicaLista } from "@/features/caracteristicas/types";
import { FILTRO_STATUS } from "@/features/comum/helpers";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Características" };

export default async function CaracteristicasPage({ searchParams }: PageProps<"/caracteristicas">) {
  const sessao = await requirePermissao("feature");
  const params = paramsDeBusca(await searchParams, ["scope", "is_active"], { ordering: "scope" });
  const pagina = await recurso.listar<CaracteristicaLista>("features", params);
  const botaoNovo = pode(sessao, "feature", "create") ? (
    <Button asChild>
      <Link href="/caracteristicas/novo"><Plus data-icon="inline-start" /> Nova característica</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Características" descricao="Infraestrutura do imóvel e do condomínio exibida nos anúncios." crumbs={[{ label: "Características" }]} acoes={botaoNovo} />
      <Toolbar
        placeholder="Buscar por nome ou slug…"
        filtros={[{ nome: "scope", rotulo: "Escopo", opcoes: ESCOPOS.map((e) => ({ value: e.value, label: e.label })) }, FILTRO_STATUS]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "scope", titulo: "Escopo", ordenavel: "scope", render: (c) => <Badge variant={c.scope === "PROPERTY" ? "secondary" : "outline"}>{ROTULO_ESCOPO[c.scope]}</Badge> },
          { chave: "sort_order", titulo: "#", ordenavel: "sort_order", className: "w-14 text-muted-foreground", render: (c) => c.sort_order },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (c) => <Link href={`/caracteristicas/${c.id}`} className="font-medium hover:underline">{c.name}</Link> },
          { chave: "slug", titulo: "Slug", render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span> },
          { chave: "is_active", titulo: "Status", render: (c) => <StatusBadge ativo={c.is_active} rotulos={["Ativa", "Inativa"]} /> },
        ]}
        acoes={(c) => (
          <RowActions
            id={c.id}
            editarHref={`/caracteristicas/${c.id}`}
            recurso="features"
            rotulo={`a característica ${c.name}`}
            revalidar={["/caracteristicas"]}
            podeEditar={pode(sessao, "feature", "update")}
            podeExcluir={pode(sessao, "feature", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhuma característica encontrada", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

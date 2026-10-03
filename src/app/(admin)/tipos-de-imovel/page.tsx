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
import { FILTRO_STATUS } from "@/features/comum/helpers";
import type { TipoImovelLista } from "@/features/tipos-de-imovel/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Tipos de imóvel" };

export default async function TiposImovelPage({ searchParams }: PageProps<"/tipos-de-imovel">) {
  const sessao = await requirePermissao("property_type");
  const params = paramsDeBusca(await searchParams, ["is_active", "is_residential"], { ordering: "sort_order" });
  const pagina = await recurso.listar<TipoImovelLista>("property-types", params);
  const botaoNovo = pode(sessao, "property_type", "create") ? (
    <Button asChild>
      <Link href="/tipos-de-imovel/novo"><Plus data-icon="inline-start" /> Novo tipo</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Tipos de imóvel" descricao="Apartamento, casa, terreno… usados no cadastro e na importação." crumbs={[{ label: "Tipos de imóvel" }]} acoes={botaoNovo} />
      <Toolbar
        placeholder="Buscar por nome ou slug…"
        filtros={[
          FILTRO_STATUS,
          { nome: "is_residential", rotulo: "Categoria", opcoes: [{ value: "true", label: "Residenciais" }, { value: "false", label: "Não residenciais" }] },
        ]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "sort_order", titulo: "#", ordenavel: "sort_order", className: "w-14 text-muted-foreground", render: (t) => t.sort_order },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (t) => <Link href={`/tipos-de-imovel/${t.id}`} className="font-medium hover:underline">{t.name}</Link> },
          { chave: "slug", titulo: "Slug", ordenavel: "slug", render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.slug}</span> },
          { chave: "is_residential", titulo: "Categoria", render: (t) => <Badge variant={t.is_residential ? "secondary" : "outline"}>{t.is_residential ? "Residencial" : "Não residencial"}</Badge> },
          { chave: "is_active", titulo: "Status", render: (t) => <StatusBadge ativo={t.is_active} /> },
        ]}
        acoes={(t) => (
          <RowActions
            id={t.id}
            editarHref={`/tipos-de-imovel/${t.id}`}
            recurso="property-types"
            rotulo={`o tipo ${t.name}`}
            revalidar={["/tipos-de-imovel"]}
            podeEditar={pode(sessao, "property_type", "update")}
            podeExcluir={pode(sessao, "property_type", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum tipo de imóvel encontrado", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

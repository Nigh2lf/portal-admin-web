import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { DicaLista } from "@/features/dicas/types";
import { filtroPortal } from "@/features/compartilhado/filtros";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Dicas" };

export default async function DicasPage({ searchParams }: PageProps<"/dicas">) {
  const sessao = await requirePermissao("tip");
  const params = paramsDeBusca(await searchParams, ["portal", "is_active"], { ordering: "sort_order" });
  const [pagina, fPortal] = await Promise.all([recurso.listar<DicaLista>("tips", params), filtroPortal()]);

  return (
    <>
      <PageHeader
        titulo="Dicas"
        descricao="Conteúdos curtos exibidos nos portais. Sem portal, a dica vale para todos."
        crumbs={[{ label: "Dicas" }]}
        acoes={
          pode(sessao, "tip", "create") && (
            <Button asChild>
              <Link href="/dicas/novo"><Plus data-icon="inline-start" /> Nova dica</Link>
            </Button>
          )
        }
      />
      <Toolbar
        placeholder="Buscar por título ou conteúdo…"
        filtros={[fPortal, { nome: "is_active", rotulo: "Status", opcoes: [{ value: "true", label: "Ativas" }, { value: "false", label: "Inativas" }] }]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "sort_order", titulo: "Ordem", ordenavel: "sort_order", className: "w-20 tabular-nums" },
          { chave: "title", titulo: "Título", ordenavel: "title", render: (d) => <Link href={`/dicas/${d.id}`} className="font-medium hover:underline">{d.title}</Link> },
          { chave: "portal_name", titulo: "Portal", render: (d) => d.portal_name ?? <span className="text-muted-foreground">Todos</span> },
          { chave: "is_active", titulo: "Status", render: (d) => <StatusBadge ativo={d.is_active} rotulos={["Ativa", "Inativa"]} /> },
          { chave: "published_at", titulo: "Publicada em", ordenavel: "published_at", render: (d) => formatarData(d.published_at, true) },
        ]}
        acoes={(d) => (
          <RowActions
            id={d.id}
            editarHref={`/dicas/${d.id}`}
            recurso="tips"
            rotulo={`a dica "${d.title}"`}
            revalidar={["/dicas"]}
            podeEditar={pode(sessao, "tip", "update")}
            podeExcluir={pode(sessao, "tip", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhuma dica cadastrada" }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { BairroLista } from "@/features/bairros/types";
import { FILTRO_STATUS, opcoesDeLookup } from "@/features/comum/helpers";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Bairros" };

export default async function BairrosPage({ searchParams }: PageProps<"/bairros">) {
  const sessao = await requirePermissao("neighborhood");
  const params = paramsDeBusca(await searchParams, ["city__state", "city", "is_active"], { ordering: "name" });
  const estadoFiltro = params.city__state ? String(params.city__state) : undefined;
  const [pagina, estados, cidades] = await Promise.all([
    recurso.listar<BairroLista>("neighborhoods", params),
    recurso.lookup("states").catch(() => []),
    recurso.lookup("cities", estadoFiltro ? { state: estadoFiltro } : {}).catch(() => []),
  ]);
  const botaoNovo = pode(sessao, "neighborhood", "create") ? (
    <Button asChild>
      <Link href="/bairros/novo"><Plus data-icon="inline-start" /> Novo bairro</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Bairros" descricao="Bairros por cidade, usados na localização dos imóveis." crumbs={[{ label: "Bairros" }]} acoes={botaoNovo} />
      <Toolbar
        placeholder="Buscar por nome, slug ou cidade…"
        filtros={[
          { nome: "city__state", rotulo: "Estado", opcoes: opcoesDeLookup(estados) },
          { nome: "city", rotulo: "Cidade", opcoes: opcoesDeLookup(cidades) },
          FILTRO_STATUS,
        ]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (b) => <Link href={`/bairros/${b.id}`} className="font-medium hover:underline">{b.name}</Link> },
          { chave: "city_name", titulo: "Cidade", ordenavel: "city__name", render: (b) => `${b.city_name}/${b.state_code}` },
          { chave: "slug", titulo: "Slug", ordenavel: "slug", render: (b) => <span className="font-mono text-xs text-muted-foreground">{b.slug}</span> },
          { chave: "is_active", titulo: "Status", render: (b) => <StatusBadge ativo={b.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (b) => formatarData(b.created_at) },
        ]}
        acoes={(b) => (
          <RowActions
            id={b.id}
            editarHref={`/bairros/${b.id}`}
            recurso="neighborhoods"
            rotulo={`o bairro ${b.name}`}
            revalidar={["/bairros"]}
            podeEditar={pode(sessao, "neighborhood", "update")}
            podeExcluir={pode(sessao, "neighborhood", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum bairro encontrado", descricao: "Ajuste os filtros ou cadastre um novo bairro.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

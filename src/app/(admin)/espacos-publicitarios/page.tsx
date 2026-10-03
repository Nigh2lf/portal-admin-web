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
import { ROTULO_PAGINA, ROTULO_TIPO, TIPOS, type EspacoLista } from "@/features/espacos-publicitarios/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarMoeda } from "@/lib/utils/format";

export const metadata = { title: "Espaços publicitários" };

export default async function EspacosPage({ searchParams }: PageProps<"/espacos-publicitarios">) {
  const sessao = await requirePermissao("ad_placement");
  // Na API, o filtro `page` (HOME/SEARCH/PROPERTY) colide com o `page` da paginação e `?page=1`
  // devolve 400. Enquanto o backend não renomear o filtro, listamos sem `page` (uma página só,
  // com `page_size` alto) e não oferecemos o filtro por página.
  const params = paramsDeBusca(await searchParams, ["kind", "is_active"], { ordering: "code", page_size: 100 });
  const { page: _paginaIgnorada, ...paramsSemPage } = params;
  void _paginaIgnorada;
  const pagina = await recurso.listar<EspacoLista>("ad-placements", paramsSemPage);
  const botaoNovo = pode(sessao, "ad_placement", "create") ? (
    <Button asChild>
      <Link href="/espacos-publicitarios/novo"><Plus data-icon="inline-start" /> Novo espaço</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Espaços publicitários" descricao="Posições de anúncio disponíveis nas páginas dos portais." crumbs={[{ label: "Espaços publicitários" }]} acoes={botaoNovo} />
      <Toolbar placeholder="Buscar por código ou nome…" filtros={[{ nome: "kind", rotulo: "Formato", opcoes: TIPOS.map((t) => ({ value: t.value, label: t.label })) }, FILTRO_STATUS]} />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "code", titulo: "Código", ordenavel: "code", className: "w-24", render: (e) => <Badge variant="secondary" className="font-mono">{e.code}</Badge> },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (e) => <Link href={`/espacos-publicitarios/${e.id}`} className="font-medium hover:underline">{e.name}</Link> },
          { chave: "page", titulo: "Página", ordenavel: "page", render: (e) => ROTULO_PAGINA[e.page] ?? e.page },
          { chave: "kind", titulo: "Formato", ordenavel: "kind", render: (e) => ROTULO_TIPO[e.kind] ?? e.kind },
          { chave: "dimensoes", titulo: "Dimensões", render: (e) => <span className="font-mono text-xs">{e.width}×{e.height}</span> },
          { chave: "monthly_price", titulo: "Valor mensal", ordenavel: "monthly_price", render: (e) => formatarMoeda(e.monthly_price) },
          { chave: "is_active", titulo: "Status", render: (e) => <StatusBadge ativo={e.is_active} /> },
        ]}
        acoes={(e) => (
          <RowActions
            id={e.id}
            editarHref={`/espacos-publicitarios/${e.id}`}
            recurso="ad-placements"
            rotulo={`o espaço ${e.code}`}
            revalidar={["/espacos-publicitarios"]}
            podeEditar={pode(sessao, "ad_placement", "update")}
            podeExcluir={pode(sessao, "ad_placement", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum espaço publicitário encontrado", descricao: "Cadastre os espaços antes de criar anúncios.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

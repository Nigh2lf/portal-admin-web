import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { FILTROS_PERIODO, filtroAnunciante, filtroPortal } from "@/features/compartilhado/filtros";
import { faixaDePreco } from "@/features/leads/preco";
import { FINALIDADES, rotuloFinalidade, type EncomendaLista } from "@/features/leads/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Encomendas" };

export default async function EncomendasPage({ searchParams }: PageProps<"/encomendas">) {
  const sessao = await requirePermissao("property_request");
  const params = paramsDeBusca(await searchParams, ["portal", "advertiser", "purpose", "is_partner_broadcast", ...FILTROS_PERIODO], { ordering: "-created_at" });
  const [pagina, fPortal, fAnunciante] = await Promise.all([
    recurso.listar<EncomendaLista>("property-requests", params),
    filtroPortal(),
    filtroAnunciante(),
  ]);

  return (
    <>
      <PageHeader
        titulo="Encomendas"
        descricao="Pedidos de imóvel feitos por visitantes que não encontraram o que procuravam."
        crumbs={[{ label: "Encomendas" }]}
      />
      <Toolbar
        placeholder="Buscar por nome, e-mail ou telefone…"
        filtros={[
          { nome: "purpose", rotulo: "Finalidade", opcoes: Object.entries(FINALIDADES).map(([value, label]) => ({ value, label })) },
          { nome: "is_partner_broadcast", rotulo: "Parceiros", opcoes: [{ value: "true", label: "Enviada a parceiros" }, { value: "false", label: "Não enviada" }] },
          fPortal,
          fAnunciante,
        ]}
      >
        <FiltroPeriodo />
      </Toolbar>
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "created_at", titulo: "Recebida em", ordenavel: "created_at", render: (e) => formatarData(e.created_at, true) },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (e) => <Link href={`/encomendas/${e.id}`} className="font-medium hover:underline">{e.name}</Link> },
          { chave: "purpose", titulo: "Finalidade", ordenavel: "purpose", render: (e) => <Badge variant="outline">{rotuloFinalidade(e.purpose)}</Badge> },
          {
            chave: "busca",
            titulo: "Procura",
            render: (e) => {
              const local = [e.neighborhood_name, e.city_name].filter(Boolean).join(", ");
              return (
                <div className="flex flex-col text-sm">
                  <span>{e.property_type_name || "Qualquer tipo"}</span>
                  {local && <span className="text-muted-foreground">{local}</span>}
                </div>
              );
            },
          },
          { chave: "preco", titulo: "Faixa de preço", render: (e) => <span className="whitespace-nowrap tabular-nums">{faixaDePreco(e.min_price, e.max_price)}</span> },
          { chave: "is_partner_broadcast", titulo: "Parceiros", render: (e) => (e.is_partner_broadcast ? <Badge variant="secondary">Enviada a parceiros</Badge> : <span className="text-muted-foreground">—</span>) },
        ]}
        acoes={(e) => (
          <RowActions
            id={e.id}
            recurso="property-requests"
            rotulo={`a encomenda de ${e.name}`}
            revalidar={["/encomendas"]}
            podeExcluir={pode(sessao, "property_request", "delete")}
            extras={<AcaoVer href={`/encomendas/${e.id}`} />}
          />
        )}
        vazio={{ titulo: "Nenhuma encomenda encontrada", descricao: "As encomendas chegam pelos formulários dos portais públicos." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { FILTROS_PERIODO, filtroPortal } from "@/features/compartilhado/filtros";
import type { LeadAnuncianteLista } from "@/features/leads/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Leads de anunciantes" };

export default async function LeadsAnunciantesPage({ searchParams }: PageProps<"/leads-anunciantes">) {
  const sessao = await requirePermissao("advertiser_lead");
  const params = paramsDeBusca(await searchParams, ["portal", ...FILTROS_PERIODO], { ordering: "-created_at" });
  const [pagina, fPortal] = await Promise.all([recurso.listar<LeadAnuncianteLista>("advertiser-leads", params), filtroPortal()]);

  return (
    <>
      <PageHeader
        titulo="Leads de anunciantes"
        descricao='Interessados em anunciar que preencheram a página "Anunciar".'
        crumbs={[{ label: "Leads de anunciantes" }]}
      />
      <Toolbar placeholder="Buscar por nome, empresa, e-mail ou telefone…" filtros={[fPortal]}>
        <FiltroPeriodo />
      </Toolbar>
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "created_at", titulo: "Recebido em", ordenavel: "created_at", render: (l) => formatarData(l.created_at, true) },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (l) => <Link href={`/leads-anunciantes/${l.id}`} className="font-medium hover:underline">{l.name}</Link> },
          { chave: "company", titulo: "Empresa", ordenavel: "company", render: (l) => l.company || "—" },
          { chave: "email", titulo: "E-mail", ordenavel: "email" },
          { chave: "phone", titulo: "Telefone", render: (l) => l.phone || "—" },
          { chave: "portal_name", titulo: "Portal" },
        ]}
        acoes={(l) => (
          <RowActions
            id={l.id}
            recurso="advertiser-leads"
            rotulo={`o lead de ${l.name}`}
            revalidar={["/leads-anunciantes"]}
            podeExcluir={pode(sessao, "advertiser_lead", "delete")}
            extras={<AcaoVer href={`/leads-anunciantes/${l.id}`} />}
          />
        )}
        vazio={{ titulo: "Nenhum lead encontrado", descricao: 'Os leads chegam pela página "Anunciar" dos portais públicos.' }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

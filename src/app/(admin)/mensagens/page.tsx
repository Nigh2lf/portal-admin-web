import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { FILTROS_PERIODO, filtroAnunciante, filtroPortal } from "@/features/compartilhado/filtros";
import type { MensagemLista } from "@/features/leads/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Mensagens de imóveis" };

export default async function MensagensPage({ searchParams }: PageProps<"/mensagens">) {
  const sessao = await requirePermissao("property_inquiry");
  const params = paramsDeBusca(await searchParams, ["advertiser", "portal", ...FILTROS_PERIODO], { ordering: "-created_at" });
  const [pagina, fAnunciante, fPortal] = await Promise.all([
    recurso.listar<MensagemLista>("property-inquiries", params),
    filtroAnunciante(),
    filtroPortal(),
  ]);

  return (
    <>
      <PageHeader
        titulo="Mensagens de imóveis"
        descricao='Leads enviados pelo formulário "Fale com o anunciante" dos portais.'
        crumbs={[{ label: "Mensagens de imóveis" }]}
      />
      <Toolbar placeholder="Buscar por nome, e-mail, telefone ou referência…" filtros={[fAnunciante, fPortal]}>
        <FiltroPeriodo />
      </Toolbar>
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "created_at", titulo: "Recebida em", ordenavel: "created_at", render: (m) => formatarData(m.created_at, true) },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (m) => <Link href={`/mensagens/${m.id}`} className="font-medium hover:underline">{m.name}</Link> },
          {
            chave: "contato",
            titulo: "Contato",
            render: (m) => (
              <div className="flex flex-col text-sm">
                <span>{m.email}</span>
                {m.phone && <span className="text-muted-foreground">{m.phone}</span>}
              </div>
            ),
          },
          {
            chave: "property_reference_code",
            titulo: "Imóvel",
            render: (m) =>
              m.property ? (
                <Link href={`/imoveis/${m.property}`} className="font-mono text-xs hover:underline">{m.property_reference_code || m.property}</Link>
              ) : (
                <span className="font-mono text-xs">{m.property_reference_code || "—"}</span>
              ),
          },
          { chave: "advertiser_name", titulo: "Anunciante" },
          { chave: "portal_name", titulo: "Portal" },
        ]}
        acoes={(m) => (
          <RowActions
            id={m.id}
            recurso="property-inquiries"
            rotulo={`a mensagem de ${m.name}`}
            revalidar={["/mensagens"]}
            podeExcluir={pode(sessao, "property_inquiry", "delete")}
            extras={<AcaoVer href={`/mensagens/${m.id}`} />}
          />
        )}
        vazio={{ titulo: "Nenhuma mensagem encontrada", descricao: "As mensagens chegam pelos formulários dos portais públicos." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

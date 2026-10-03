import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BotaoExcluir } from "@/features/compartilhado/botao-excluir";
import { ListaDetalhe, SecaoDetalhe, TextoLongo } from "@/features/compartilhado/detalhe";
import { faixaDePreco } from "@/features/leads/preco";
import { rotuloFinalidade, rotuloFinanciamento, type EncomendaDetalhe } from "@/features/leads/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData, formatarMoeda } from "@/lib/utils/format";

export const metadata = { title: "Encomenda" };

export default async function EncomendaPage({ params }: PageProps<"/encomendas/[id]">) {
  const sessao = await requirePermissao("property_request");
  const { id } = await params;
  const e = await recurso.obter<EncomendaDetalhe>("property-requests", id).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!e) notFound();

  return (
    <>
      <PageHeader
        titulo={e.name}
        descricao={`Recebida em ${formatarData(e.created_at, true)} pelo portal ${e.portal_name}`}
        crumbs={[{ label: "Encomendas", href: "/encomendas" }, { label: "Detalhe" }]}
        acoes={pode(sessao, "property_request", "delete") && <BotaoExcluir recurso="property-requests" id={e.id} rotulo={`a encomenda de ${e.name}`} voltarHref="/encomendas" />}
      />
      <div className="flex max-w-4xl flex-col gap-6">
        <SecaoDetalhe titulo="O que procura">
          <ListaDetalhe
            itens={[
              { rotulo: "Finalidade", valor: <Badge variant="outline">{rotuloFinalidade(e.purpose)}</Badge> },
              { rotulo: "Tipo de imóvel", valor: e.property_type_name || "Qualquer tipo" },
              { rotulo: "Cidade", valor: e.city_name },
              { rotulo: "Bairro", valor: e.neighborhood_name },
              { rotulo: "Faixa de preço", valor: faixaDePreco(e.min_price, e.max_price) },
              { rotulo: "Preço mínimo", valor: formatarMoeda(e.min_price) },
              { rotulo: "Preço máximo", valor: formatarMoeda(e.max_price) },
              { rotulo: "Forma de pagamento", valor: rotuloFinanciamento(e.funding) },
              { rotulo: "Em condomínio", valor: e.is_in_condominium === null ? "Indiferente" : e.is_in_condominium ? "Sim" : "Não" },
              { rotulo: "Enviada a parceiros", valor: e.is_partner_broadcast ? <Badge variant="secondary">Sim</Badge> : "Não" },
            ]}
          />
          <div className="mt-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Observações</p>
            <TextoLongo texto={e.message} vazio="Sem observações." />
          </div>
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Contato">
          <ListaDetalhe
            itens={[
              { rotulo: "Nome", valor: e.name },
              { rotulo: "E-mail", valor: <a href={`mailto:${e.email}`} className="hover:underline">{e.email}</a> },
              { rotulo: "Telefone", valor: e.phone },
              { rotulo: "Portal", valor: e.portal_name },
              { rotulo: "Anunciante", valor: e.advertiser_name },
            ]}
          />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Dados técnicos">
          <ListaDetalhe
            itens={[
              { rotulo: "IP", valor: e.ip_address ? <span className="font-mono">{e.ip_address}</span> : null },
              { rotulo: "ID legado", valor: e.legacy_id },
              { rotulo: "Atualizada em", valor: formatarData(e.updated_at, true) },
            ]}
          />
        </SecaoDetalhe>
      </div>
    </>
  );
}

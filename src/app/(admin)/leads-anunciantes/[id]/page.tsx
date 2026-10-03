import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BotaoExcluir } from "@/features/compartilhado/botao-excluir";
import { ListaDetalhe, SecaoDetalhe, TextoLongo } from "@/features/compartilhado/detalhe";
import type { LeadAnuncianteDetalhe } from "@/features/leads/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Lead de anunciante" };

export default async function LeadAnunciantePage({ params }: PageProps<"/leads-anunciantes/[id]">) {
  const sessao = await requirePermissao("advertiser_lead");
  const { id } = await params;
  const l = await recurso.obter<LeadAnuncianteDetalhe>("advertiser-leads", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!l) notFound();

  return (
    <>
      <PageHeader
        titulo={l.name}
        descricao={`Recebido em ${formatarData(l.created_at, true)} pelo portal ${l.portal_name}`}
        crumbs={[{ label: "Leads de anunciantes", href: "/leads-anunciantes" }, { label: "Detalhe" }]}
        acoes={pode(sessao, "advertiser_lead", "delete") && <BotaoExcluir recurso="advertiser-leads" id={l.id} rotulo={`o lead de ${l.name}`} voltarHref="/leads-anunciantes" />}
      />
      <div className="flex max-w-4xl flex-col gap-6">
        <SecaoDetalhe titulo="Mensagem">
          <TextoLongo texto={l.message} vazio="O interessado não deixou mensagem." />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Contato">
          <ListaDetalhe
            itens={[
              { rotulo: "Nome", valor: l.name },
              { rotulo: "Empresa", valor: l.company },
              { rotulo: "E-mail", valor: <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a> },
              { rotulo: "Telefone", valor: l.phone },
              { rotulo: "Portal", valor: l.portal_name },
            ]}
          />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Dados técnicos">
          <ListaDetalhe
            itens={[
              { rotulo: "ID legado", valor: l.legacy_id },
              { rotulo: "Atualizado em", valor: formatarData(l.updated_at, true) },
            ]}
          />
        </SecaoDetalhe>
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BotaoExcluir } from "@/features/compartilhado/botao-excluir";
import { ListaDetalhe, SecaoDetalhe, TextoLongo } from "@/features/compartilhado/detalhe";
import { rotuloCanal, type MensagemDetalhe } from "@/features/leads/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Mensagem de imóvel" };

export default async function MensagemPage({ params }: PageProps<"/mensagens/[id]">) {
  const sessao = await requirePermissao("property_inquiry");
  const { id } = await params;
  const m = await recurso.obter<MensagemDetalhe>("property-inquiries", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!m) notFound();

  return (
    <>
      <PageHeader
        titulo={m.name}
        descricao={`Recebida em ${formatarData(m.created_at, true)} pelo portal ${m.portal_name}`}
        crumbs={[{ label: "Mensagens de imóveis", href: "/mensagens" }, { label: "Detalhe" }]}
        acoes={pode(sessao, "property_inquiry", "delete") && <BotaoExcluir recurso="property-inquiries" id={m.id} rotulo={`a mensagem de ${m.name}`} voltarHref="/mensagens" />}
      />
      <div className="flex max-w-4xl flex-col gap-6">
        <SecaoDetalhe titulo="Mensagem">
          <TextoLongo texto={m.message} />
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Prefere contato por:</span>
            {m.contact_preferences.length === 0 && <span className="text-xs text-muted-foreground">não informado</span>}
            {m.contact_preferences.map((c) => (
              <Badge key={c} variant="secondary">{rotuloCanal(c)}</Badge>
            ))}
          </div>
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Contato">
          <ListaDetalhe
            itens={[
              { rotulo: "Nome", valor: m.name },
              { rotulo: "E-mail", valor: <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a> },
              { rotulo: "Telefone", valor: m.phone },
              { rotulo: "Dispositivo", valor: m.is_mobile ? "Celular" : "Computador" },
            ]}
          />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Imóvel e anunciante">
          <ListaDetalhe
            itens={[
              {
                rotulo: "Imóvel",
                valor: m.property ? (
                  <Link href={`/imoveis/${m.property}`} className="hover:underline">{m.property_title || m.property_reference_code || m.property}</Link>
                ) : (
                  m.property_title || null
                ),
              },
              { rotulo: "Referência", valor: m.property_reference_code ? <span className="font-mono">{m.property_reference_code}</span> : null },
              { rotulo: "Anunciante", valor: m.advertiser_name },
              { rotulo: "Portal", valor: m.portal_name },
              { rotulo: "Encaminhada ao CRM em", valor: formatarData(m.forwarded_to_crm_at, true) },
            ]}
          />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Dados técnicos">
          <ListaDetalhe
            itens={[
              { rotulo: "IP", valor: m.ip_address ? <span className="font-mono">{m.ip_address}</span> : null },
              { rotulo: "Origem (referer)", valor: m.referer ? <span className="break-all">{m.referer}</span> : null, largo: true },
              { rotulo: "ID legado", valor: m.legacy_id },
              { rotulo: "Atualizada em", valor: formatarData(m.updated_at, true) },
            ]}
          />
        </SecaoDetalhe>
      </div>
    </>
  );
}

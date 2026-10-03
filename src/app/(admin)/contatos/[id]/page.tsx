import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BotaoExcluir } from "@/features/compartilhado/botao-excluir";
import { ListaDetalhe, SecaoDetalhe, TextoLongo } from "@/features/compartilhado/detalhe";
import type { ContatoDetalhe } from "@/features/leads/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Contato do site" };

export default async function ContatoPage({ params }: PageProps<"/contatos/[id]">) {
  const sessao = await requirePermissao("contact_message");
  const { id } = await params;
  const c = await recurso.obter<ContatoDetalhe>("contact-messages", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!c) notFound();

  return (
    <>
      <PageHeader
        titulo={c.name}
        descricao={`Recebido em ${formatarData(c.created_at, true)} pelo portal ${c.portal_name}`}
        crumbs={[{ label: "Contatos do site", href: "/contatos" }, { label: "Detalhe" }]}
        acoes={pode(sessao, "contact_message", "delete") && <BotaoExcluir recurso="contact-messages" id={c.id} rotulo={`o contato de ${c.name}`} voltarHref="/contatos" />}
      />
      <div className="flex max-w-4xl flex-col gap-6">
        <SecaoDetalhe titulo={c.subject || "Mensagem"} descricao={c.subject ? "Assunto informado pelo visitante." : undefined}>
          <TextoLongo texto={c.message} />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Contato">
          <ListaDetalhe
            itens={[
              { rotulo: "Nome", valor: c.name },
              { rotulo: "E-mail", valor: <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a> },
              { rotulo: "Telefone", valor: c.phone },
              { rotulo: "Assunto", valor: c.subject },
              { rotulo: "Portal", valor: c.portal_name },
            ]}
          />
        </SecaoDetalhe>

        <SecaoDetalhe titulo="Dados técnicos">
          <ListaDetalhe
            itens={[
              { rotulo: "IP", valor: c.ip_address ? <span className="font-mono">{c.ip_address}</span> : null },
              { rotulo: "ID legado", valor: c.legacy_id },
              { rotulo: "Atualizado em", valor: formatarData(c.updated_at, true) },
            ]}
          />
        </SecaoDetalhe>
      </div>
    </>
  );
}

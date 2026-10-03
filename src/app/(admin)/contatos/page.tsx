import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { AcaoVer } from "@/features/compartilhado/acao-ver";
import { FiltroPeriodo } from "@/features/compartilhado/filtro-periodo";
import { FILTROS_PERIODO, filtroPortal } from "@/features/compartilhado/filtros";
import type { ContatoLista } from "@/features/leads/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Contatos do site" };

export default async function ContatosPage({ searchParams }: PageProps<"/contatos">) {
  const sessao = await requirePermissao("contact_message");
  const params = paramsDeBusca(await searchParams, ["portal", ...FILTROS_PERIODO], { ordering: "-created_at" });
  const [pagina, fPortal] = await Promise.all([recurso.listar<ContatoLista>("contact-messages", params), filtroPortal()]);

  return (
    <>
      <PageHeader
        titulo="Contatos do site"
        descricao='Mensagens enviadas pelo formulário "Fale conosco" dos portais.'
        crumbs={[{ label: "Contatos do site" }]}
      />
      <Toolbar placeholder="Buscar por nome, e-mail, telefone ou assunto…" filtros={[fPortal]}>
        <FiltroPeriodo />
      </Toolbar>
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "created_at", titulo: "Recebido em", ordenavel: "created_at", render: (c) => formatarData(c.created_at, true) },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (c) => <Link href={`/contatos/${c.id}`} className="font-medium hover:underline">{c.name}</Link> },
          {
            chave: "contato",
            titulo: "Contato",
            render: (c) => (
              <div className="flex flex-col text-sm">
                <span>{c.email}</span>
                {c.phone && <span className="text-muted-foreground">{c.phone}</span>}
              </div>
            ),
          },
          { chave: "subject", titulo: "Assunto", ordenavel: "subject", render: (c) => c.subject || "—" },
          { chave: "portal_name", titulo: "Portal" },
        ]}
        acoes={(c) => (
          <RowActions
            id={c.id}
            recurso="contact-messages"
            rotulo={`o contato de ${c.name}`}
            revalidar={["/contatos"]}
            podeExcluir={pode(sessao, "contact_message", "delete")}
            extras={<AcaoVer href={`/contatos/${c.id}`} />}
          />
        )}
        vazio={{ titulo: "Nenhum contato encontrado", descricao: "Os contatos chegam pelo formulário dos portais públicos." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { BloqueioLista } from "@/features/bloqueios/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Remetentes bloqueados" };

export default async function BloqueiosPage({ searchParams }: PageProps<"/bloqueios">) {
  const sessao = await requirePermissao("blocked_sender");
  const params = paramsDeBusca(await searchParams, ["is_active"], { ordering: "-created_at" });
  const pagina = await recurso.listar<BloqueioLista>("blocked-senders", params);

  return (
    <>
      <PageHeader
        titulo="Remetentes bloqueados"
        descricao="E-mails e IPs impedidos de enviar formulários nos portais (antispam)."
        crumbs={[{ label: "Remetentes bloqueados" }]}
        acoes={
          pode(sessao, "blocked_sender", "create") && (
            <Button asChild>
              <Link href="/bloqueios/novo"><Plus data-icon="inline-start" /> Novo bloqueio</Link>
            </Button>
          )
        }
      />
      <Toolbar
        placeholder="Buscar por e-mail, IP ou motivo…"
        filtros={[{ nome: "is_active", rotulo: "Status", opcoes: [{ value: "true", label: "Ativos" }, { value: "false", label: "Inativos" }] }]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "email", titulo: "E-mail", ordenavel: "email", render: (b) => <Link href={`/bloqueios/${b.id}`} className="font-medium hover:underline">{b.email || "—"}</Link> },
          { chave: "ip_address", titulo: "IP", ordenavel: "ip_address", render: (b) => (b.ip_address ? <span className="font-mono text-xs">{b.ip_address}</span> : "—") },
          { chave: "reason", titulo: "Motivo", render: (b) => b.reason || "—" },
          { chave: "is_active", titulo: "Status", ordenavel: "is_active", render: (b) => <StatusBadge ativo={b.is_active} /> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (b) => formatarData(b.created_at) },
        ]}
        acoes={(b) => (
          <RowActions
            id={b.id}
            editarHref={`/bloqueios/${b.id}`}
            recurso="blocked-senders"
            rotulo={`o bloqueio de ${b.email || b.ip_address}`}
            revalidar={["/bloqueios"]}
            podeEditar={pode(sessao, "blocked_sender", "update")}
            podeExcluir={pode(sessao, "blocked_sender", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum remetente bloqueado" }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

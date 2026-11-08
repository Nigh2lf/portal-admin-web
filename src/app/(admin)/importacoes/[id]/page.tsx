import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/data/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BotaoExcluir } from "@/features/compartilhado/botao-excluir";
import { ListaDetalhe, SecaoDetalhe } from "@/features/compartilhado/detalhe";
import { formatDuration } from "@/features/importacoes/format";
import { StatCard } from "@/features/importacoes/stat-card";
import { RunStatusBadge } from "@/features/importacoes/status-badges";
import type { ImportacaoDetalhe } from "@/features/importacoes/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData, formatarNumero } from "@/lib/utils/format";

export const metadata = { title: "Importação XML" };

export default async function ImportacaoPage({
  params,
}: PageProps<"/importacoes/[id]">) {
  const sessao = await requirePermissao("xml_import_run");
  const { id } = await params;
  const i = await recurso
    .obter<ImportacaoDetalhe>("xml-import-runs", id)
    .catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    });
  if (!i) notFound();

  // A execução fica dentro do seu lote; sem lote, nas execuções avulsas.
  const parent = i.batch
    ? {
        label: `Lote de ${formatarData(i.batch_started_at, true)}`,
        href: `/importacoes/lotes/${i.batch}`,
      }
    : { label: "Execuções avulsas", href: "/importacoes/avulsas" };

  return (
    <>
      <PageHeader
        titulo={`Importação de ${i.advertiser_name}`}
        descricao={`Iniciada em ${formatarData(i.started_at, true)}`}
        crumbs={[
          { label: "Importações XML", href: "/importacoes" },
          parent,
          { label: i.advertiser_name },
        ]}
        acoes={
          pode(sessao, "xml_import_run", "delete") && (
            <BotaoExcluir
              recurso="xml-import-runs"
              id={i.id}
              rotulo="esta importação"
              voltarHref={parent.href}
              descricao="Os erros vinculados permanecem registrados, mas deixam de apontar para esta execução."
            />
          )
        }
      />
      <div className="flex flex-col gap-6">
        <SecaoDetalhe titulo="Resumo">
          <ListaDetalhe
            itens={[
              { rotulo: "Anunciante", valor: i.advertiser_name },
              { rotulo: "Status", valor: <RunStatusBadge status={i.status} /> },
              { rotulo: "Motivo", valor: i.error_message || "—" },
              { rotulo: "Início", valor: formatarData(i.started_at, true) },
              { rotulo: "Término", valor: formatarData(i.finished_at, true) },
              {
                rotulo: "Duração",
                valor: formatDuration(i.started_at, i.finished_at),
              },
              {
                rotulo: "Relatório por e-mail",
                valor: (
                  <StatusBadge
                    ativo={i.report_email_sent}
                    rotulos={["Enviado", "Não enviado"]}
                  />
                ),
              },
            ]}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard label="Imóveis no XML" value={i.total_properties} />
            <StatCard
              label="Válidos"
              value={i.valid_properties}
              className="text-success"
            />
            <StatCard
              label="Inválidos"
              value={i.invalid_properties}
              className={i.invalid_properties > 0 ? "text-destructive" : ""}
            />
          </div>
        </SecaoDetalhe>

        <section className="overflow-hidden rounded-xl border bg-card">
          <header className="border-b p-5">
            <h2 className="font-semibold">Erros da importação</h2>
            <p className="text-sm text-muted-foreground">
              {i.errors.length === 0
                ? "Nenhum erro registrado nesta execução."
                : `${formatarNumero(i.errors.length)} registro(s) com problema.`}
            </p>
          </header>
          {i.errors.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="whitespace-nowrap">Quando</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Referência
                  </TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Dados recebidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {i.errors.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap align-top text-muted-foreground">
                      {formatarData(e.created_at, true)}
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs">
                      {e.property_reference_code || "—"}
                    </TableCell>
                    <TableCell className="align-top break-words">
                      {e.message}
                    </TableCell>
                    <TableCell className="align-top">
                      {e.payload ? (
                        <details>
                          <summary className="cursor-pointer text-xs text-primary hover:underline">
                            Ver payload
                          </summary>
                          <pre className="mt-2 max-h-64 max-w-md overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap break-all">
                            {e.payload}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <SecaoDetalhe titulo="Dados técnicos">
          <ListaDetalhe
            itens={[
              { rotulo: "ID legado", valor: i.legacy_id },
              {
                rotulo: "Registrada em",
                valor: formatarData(i.created_at, true),
              },
              {
                rotulo: "Atualizada em",
                valor: formatarData(i.updated_at, true),
              },
            ]}
          />
        </SecaoDetalhe>
      </div>
    </>
  );
}

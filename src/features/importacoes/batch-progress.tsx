"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, OctagonX, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatarData, formatarNumero } from "@/lib/utils/format";
import { cancelBatch, readActiveBatch, readBatch } from "./actions";
import { BatchStatusBadge, RunStatusBadge } from "./status-badges";
import {
  ACTIVE_BATCH_STATUSES,
  BATCH_ORIGIN_LABEL,
  type ImportBatchDetail,
} from "./types";

const POLL_MS = 3000;

/**
 * Card do lote em andamento: barra de progresso, anunciante atual, contadores e cancelar.
 * Consulta a API a cada poucos segundos enquanto o lote está ativo; ao terminar, mostra o
 * resultado final e recarrega a lista de execuções.
 */
export function BatchProgress({
  initial,
  canCancel,
}: {
  initial: ImportBatchDetail | null;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [batch, setBatch] = useState<ImportBatchDetail | null>(initial);
  const [dismissed, setDismissed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  const [trackedId, setTrackedId] = useState(initial?.id);

  // Um lote novo vindo do servidor (depois de "Importar agora") substitui o card fechado.
  if (initial && initial.id !== trackedId) {
    setTrackedId(initial.id);
    setBatch(initial);
    setDismissed(false);
  }

  const active = !!batch && ACTIVE_BATCH_STATUSES.includes(batch.status);
  const batchId = batch?.id;

  useEffect(() => {
    if (!active || !batchId) return;
    const id = batchId;
    const timer = setInterval(async () => {
      const current = await readActiveBatch().catch(() => undefined);
      if (current === undefined) return; // falha de rede: tenta de novo no próximo tick
      if (current && current.id === id) {
        setBatch(current);
        return;
      }
      // Terminou (ou outro lote assumiu): busca o estado final deste e atualiza a lista.
      const final = await readBatch(id).catch(() => null);
      setBatch(final ?? current);
      router.refresh();
      if (final?.status === "SUCCESS") toast.success("Importação concluída.");
      else if (final?.status === "PARTIAL")
        toast.warning("Importação concluída com falhas.");
      else if (final?.status === "CANCELLED")
        toast.info("Importação cancelada.");
      else if (final?.status === "FAILED") toast.error("A importação falhou.");
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [active, batchId, router]);

  if (!batch || dismissed) return null;

  const total = batch.total_advertisers || 1;
  const percent = Math.min(100, Math.round((batch.done / total) * 100));
  const cancelling = batch.status === "CANCELLING";

  const cancel = () =>
    start(async () => {
      const r = await cancelBatch(batch.id);
      setConfirming(false);
      if (!r.ok) {
        toast.error(r.message ?? "Não foi possível cancelar.");
        return;
      }
      if (r.data) setBatch(r.data);
      toast.info(r.message ?? "Cancelamento solicitado.");
    });

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border bg-card p-5"
      aria-live="polite"
      aria-label="Progresso da importação"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">
              {active ? "Importação em andamento" : "Última importação em lote"}
            </h2>
            <BatchStatusBadge status={batch.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {batch.scope === "ALL"
              ? "Todos os anunciantes"
              : `${formatarNumero(batch.total_advertisers)} anunciante(s) escolhido(s)`}
            {" · "}
            {BATCH_ORIGIN_LABEL[batch.origin]}
            {batch.created_by_name ? ` por ${batch.created_by_name}` : ""}
            {" · "}
            {batch.started_at
              ? `início ${formatarData(batch.started_at, true)}`
              : `criado ${formatarData(batch.created_at, true)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {active && canCancel && (
            <Button
              variant="outline"
              size="sm"
              disabled={pending || cancelling}
              onClick={() => setConfirming(true)}
            >
              {cancelling ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <OctagonX data-icon="inline-start" />
              )}
              {cancelling ? "Cancelando…" : "Cancelar"}
            </Button>
          )}
          {!active && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              onClick={() => setDismissed(true)}
            >
              <X />
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span>
            {formatarNumero(batch.done)} de{" "}
            {formatarNumero(batch.total_advertisers)} anunciantes
          </span>
          <span className="tabular-nums text-muted-foreground">{percent}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={batch.total_advertisers}
          aria-valuenow={batch.done}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${
              batch.status === "FAILED"
                ? "bg-destructive"
                : batch.status === "CANCELLED"
                  ? "bg-muted-foreground/40"
                  : "bg-primary"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {active && (
          <p className="text-sm text-muted-foreground">
            {batch.status === "QUEUED"
              ? "Aguardando outra importação terminar…"
              : batch.current_advertiser_name
                ? `Importando ${batch.current_advertiser_name}…`
                : "Preparando…"}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            ["Importados", batch.ok, "text-success"],
            [
              "Com falha",
              batch.failed,
              batch.failed > 0 ? "text-destructive" : "",
            ],
            ["Não executados", batch.skipped, ""],
            ["Cancelados", batch.cancelled, ""],
          ] as Array<[string, number, string]>
        ).map(([label, n, color]) => (
          <div key={label} className="rounded-lg border p-2 text-center">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className={`text-lg font-semibold tabular-nums ${color}`}>
              {formatarNumero(n)}
            </dd>
          </div>
        ))}
      </dl>

      {batch.error_message && !active && (
        <details className="rounded-lg border border-destructive/30 bg-destructive/5 text-sm">
          <summary className="cursor-pointer px-3 py-2 font-medium text-destructive">
            Falhas
          </summary>
          <pre className="max-h-48 overflow-auto border-t px-3 py-2 text-xs whitespace-pre-wrap">
            {batch.error_message}
          </pre>
        </details>
      )}

      {batch.runs.length > 0 && (
        <details className="rounded-lg border text-sm" open={!active}>
          <summary className="cursor-pointer px-3 py-2 font-medium">
            Anunciantes processados ({formatarNumero(batch.runs.length)})
          </summary>
          <ul className="max-h-64 divide-y overflow-y-auto border-t">
            {batch.runs.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5"
              >
                <Link
                  href={`/importacoes/${r.id}`}
                  className="font-medium hover:underline"
                >
                  {r.advertiser_name}
                </Link>
                <RunStatusBadge status={r.status} />
                {r.status === "SUCCESS" && (
                  <span className="text-xs text-muted-foreground">
                    {formatarNumero(r.valid_properties)} válidos ·{" "}
                    {formatarNumero(r.invalid_properties)} inválidos
                  </span>
                )}
                {r.error_message && r.status !== "SUCCESS" && (
                  <span className="text-xs text-muted-foreground">
                    {r.error_message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {active && batch.pending.length > 0 && (
        <details className="rounded-lg border text-sm">
          <summary className="cursor-pointer px-3 py-2 font-medium">
            Na fila ({formatarNumero(batch.pending.length)})
          </summary>
          <ul className="max-h-48 divide-y overflow-y-auto border-t">
            {batch.pending.map((p) => (
              <li key={p.id} className="px-3 py-1.5 text-muted-foreground">
                {p.name}
              </li>
            ))}
          </ul>
        </details>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar a importação?</AlertDialogTitle>
            <AlertDialogDescription>
              O anunciante que está sendo importado agora termina normalmente;
              os que ainda estão na fila não serão importados. Nenhum anunciante
              fica pela metade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={cancel} disabled={pending}>
              {pending && (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              Cancelar importação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

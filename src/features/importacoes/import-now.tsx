"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CloudDownload,
  FlaskConical,
  LoaderCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarData, formatarNumero } from "@/lib/utils/format";
import { readSimulation, startBatch, startSimulation } from "./actions";
import { CAMPOS_IMOVEL, type AnuncianteXml, type Simulacao } from "./types";

const POLL_MS = 3000;

/**
 * Botão "Importar agora": popup para escolher todos os anunciantes ou alguns deles.
 * Com um único anunciante marcado dá para simular (mostra a diferença sem gravar).
 */
export function ImportNow({
  advertisers,
  disabled,
}: {
  advertisers: AnuncianteXml[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [simulation, setSimulation] = useState<Simulacao | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [pending, start] = useTransition();
  const requestedAt = useRef<number>(0);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return advertisers;
    return advertisers.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.integrator ?? "").toLowerCase().includes(term) ||
        String(a.legacy_id ?? "").includes(term),
    );
  }, [advertisers, search]);

  const count = all ? advertisers.length : selected.size;
  const single = !all && selected.size === 1 ? [...selected][0] : null;

  useEffect(() => {
    if (!simulating || !single) return;
    const timer = setInterval(async () => {
      const s = await readSimulation(single).catch(() => null);
      // Só aceita a simulação gerada depois do clique (a anterior pode ainda estar no disco).
      if (
        s &&
        !s.running &&
        new Date(s.gerado_em).getTime() >= requestedAt.current
      ) {
        setSimulation(s);
        setSimulating(false);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [simulating, single]);

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const markVisible = () =>
    setSelected(
      (current) => new Set([...current, ...visible.map((a) => a.id)]),
    );

  const reset = () => {
    setSimulation(null);
    setSimulating(false);
  };

  const simulate = () => {
    if (!single) return;
    start(async () => {
      requestedAt.current = Date.now() - 2000;
      const r = await startSimulation(single);
      if (!r.ok) {
        toast.error(r.message ?? "Não foi possível iniciar a simulação.");
        return;
      }
      setSimulation(null);
      setSimulating(true);
      toast.info("Simulando: baixando o XML e comparando com o banco…");
    });
  };

  const run = () =>
    start(async () => {
      const r = await startBatch(all ? null : [...selected]);
      if (!r.ok) {
        toast.error(r.message ?? "Não foi possível iniciar a importação.");
        return;
      }
      toast.success(
        all
          ? `Importação de todos os ${count} anunciantes iniciada.`
          : `Importação de ${count} anunciante(s) iniciada.`,
      );
      setOpen(false);
      reset();
      router.refresh();
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          title={
            disabled ? "Já existe uma importação em andamento." : undefined
          }
        >
          <CloudDownload data-icon="inline-start" /> Importar agora
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Importar agora</DialogTitle>
          <DialogDescription>
            Baixa o XML de cada anunciante e compara com os imóveis do portal. A
            importação roda em segundo plano; o progresso aparece na página e
            pode ser cancelado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <Checkbox
              checked={all}
              onCheckedChange={(v) => {
                setAll(v === true);
                reset();
              }}
            />
            <span className="flex-1">
              <span className="font-medium">Todos os anunciantes</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {formatarNumero(advertisers.length)} com XML ativo, quem está há
                mais tempo sem importar primeiro
              </span>
            </span>
          </label>

          {!all && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-48 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Buscar anunciante"
                    placeholder="Buscar por nome, integrador ou ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markVisible}
                >
                  Marcar visíveis
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={selected.size === 0}
                  onClick={() => {
                    setSelected(new Set());
                    reset();
                  }}
                >
                  Limpar
                </Button>
              </div>
              <ul
                className="max-h-72 divide-y overflow-y-auto rounded-lg border"
                aria-label="Anunciantes"
              >
                {visible.length === 0 && (
                  <li className="p-3 text-sm text-muted-foreground">
                    Nenhum anunciante encontrado.
                  </li>
                )}
                {visible.map((a) => {
                  const id = `imp-${a.id}`;
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <Checkbox
                        id={id}
                        checked={selected.has(a.id)}
                        onCheckedChange={(v) => {
                          toggle(a.id, v === true);
                          reset();
                        }}
                      />
                      <Label
                        htmlFor={id}
                        className="flex flex-1 cursor-pointer flex-col gap-0.5 font-normal"
                      >
                        <span className="font-medium">
                          {a.name}
                          {a.integrator && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {a.integrator}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {a.last_imported_at
                            ? `Última importação ${formatarData(a.last_imported_at, true)}`
                            : "Nunca importado"}
                        </span>
                      </Label>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted-foreground">
                {selected.size === 0
                  ? "Marque um ou mais anunciantes."
                  : `${formatarNumero(selected.size)} anunciante(s) marcado(s).`}
              </p>
            </div>
          )}

          {simulation && single && <SimulationResult s={simulation} />}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={!single || pending || simulating}
            title={
              single
                ? undefined
                : "Marque exatamente um anunciante para simular."
            }
            onClick={simulate}
          >
            {simulating ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <FlaskConical data-icon="inline-start" />
            )}
            {simulating ? "Simulando…" : "Simular"}
          </Button>
          <Button
            type="button"
            disabled={count === 0 || pending || simulating}
            onClick={run}
          >
            {pending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <CloudDownload data-icon="inline-start" />
            )}
            {all
              ? `Importar todos (${formatarNumero(count)})`
              : `Importar ${formatarNumero(count)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SimulationResult({ s }: { s: Simulacao }) {
  if (s.erro) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p className="font-medium text-destructive">A simulação falhou</p>
        <p className="mt-1">{s.erro}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatarData(s.gerado_em, true)}
        </p>
      </div>
    );
  }
  const numbers: Array<[string, number | undefined, string]> = [
    ["No XML", s.total_feed, ""],
    ["Novos", s.novos, "text-success"],
    ["Alterados", s.alterados, "text-warning"],
    ["Iguais", s.iguais, ""],
    ["Excluídos", s.excluidos, "text-destructive"],
    ["Ignorados", s.ignorados, "text-destructive"],
  ];
  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Resultado da simulação"
    >
      <p className="text-xs text-muted-foreground">
        Simulação de {formatarData(s.gerado_em, true)} · formato {s.formato}
      </p>
      <dl className="grid grid-cols-3 gap-2">
        {numbers.map(([label, n, color]) => (
          <div key={label} className="rounded-lg border p-2 text-center">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className={`text-lg font-semibold tabular-nums ${color}`}>
              {formatarNumero(n ?? 0)}
            </dd>
          </div>
        ))}
      </dl>
      <CodeList
        title="Alterados"
        items={s.codigos_alterados?.map((a) => ({
          key: a.codigo,
          text: a.campos.map((c) => CAMPOS_IMOVEL[c] ?? c).join(", "),
        }))}
      />
      <CodeList
        title="Ignorados"
        items={s.ignorados_lista?.map((i) => ({
          key: i.codigo || "(sem código)",
          text: i.motivo,
        }))}
      />
      <CodeList
        title="Excluídos (saíram do XML)"
        items={s.codigos_excluidos?.map((c) => ({ key: c, text: "" }))}
      />
      <CodeList
        title="Novos"
        items={s.codigos_novos?.map((c) => ({ key: c, text: "" }))}
      />
    </section>
  );
}

function CodeList({
  title,
  items,
}: {
  title: string;
  items?: Array<{ key: string; text: string }>;
}) {
  if (!items?.length) return null;
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
        {title} <Badge variant="secondary">{items.length}</Badge>
      </summary>
      <ul className="max-h-64 divide-y overflow-y-auto border-t text-sm">
        {items.map((i, idx) => (
          <li key={`${i.key}-${idx}`} className="flex gap-3 px-3 py-1.5">
            <span className="shrink-0 font-mono text-xs">{i.key}</span>
            {i.text && <span className="text-muted-foreground">{i.text}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}

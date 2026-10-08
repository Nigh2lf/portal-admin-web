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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarData, formatarNumero } from "@/lib/utils/format";
import { readSimulation, startBatch, startSimulation } from "./actions";
import { SimulationResult } from "./simulation-result";
import type { AnuncianteXml, Simulacao } from "./types";

const POLL_MS = 3000;
const ALL_INTEGRATORS = "__all__";

type Scope = "all" | "selected";
type Recency = "any" | "never" | "7d" | "30d";

function matchesRecency(a: AnuncianteXml, recency: Recency) {
  if (recency === "any") return true;
  if (recency === "never") return !a.last_imported_at;
  if (!a.last_imported_at) return true;
  const days = recency === "7d" ? 7 : 30;
  return (
    Date.now() - new Date(a.last_imported_at).getTime() > days * 86_400_000
  );
}

/**
 * Tela "Importar agora": escolhe todos os anunciantes ou marca vários na tabela
 * (com busca e filtros), simula quando há um só marcado e dispara o lote.
 */
export function ImportForm({
  advertisers,
  disabled,
}: {
  advertisers: AnuncianteXml[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("all");
  const [search, setSearch] = useState("");
  const [integrator, setIntegrator] = useState(ALL_INTEGRATORS);
  const [recency, setRecency] = useState<Recency>("any");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [simulation, setSimulation] = useState<Simulacao | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [pending, start] = useTransition();
  const requestedAt = useRef<number>(0);

  const integrators = useMemo(
    () =>
      [
        ...new Set(advertisers.map((a) => a.integrator).filter(Boolean)),
      ].sort() as string[],
    [advertisers],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return advertisers.filter((a) => {
      if (integrator !== ALL_INTEGRATORS && (a.integrator ?? "") !== integrator)
        return false;
      if (!matchesRecency(a, recency)) return false;
      if (!term) return true;
      return (
        a.name.toLowerCase().includes(term) ||
        (a.integrator ?? "").toLowerCase().includes(term) ||
        String(a.legacy_id ?? "").includes(term)
      );
    });
  }, [advertisers, search, integrator, recency]);

  const all = scope === "all";
  const count = all ? advertisers.length : selected.size;
  const single = !all && selected.size === 1 ? [...selected][0] : null;
  const singleAdvertiser = single
    ? advertisers.find((a) => a.id === single)
    : null;
  const allVisibleSelected =
    visible.length > 0 && visible.every((a) => selected.has(a.id));

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

  const resetSimulation = () => {
    setSimulation(null);
    setSimulating(false);
  };

  const toggle = (id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    resetSimulation();
  };

  const toggleVisible = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const a of visible) {
        if (checked) next.add(a.id);
        else next.delete(a.id);
      }
      return next;
    });
    resetSimulation();
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
          ? `Importação de todos os ${formatarNumero(count)} anunciantes iniciada.`
          : `Importação de ${formatarNumero(count)} anunciante(s) iniciada.`,
      );
      resetSimulation();
      setSelected(new Set());
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">O que importar</h2>
        <p className="text-sm text-muted-foreground">
          Baixa o XML de cada anunciante e compara com os imóveis do portal. A
          importação roda em segundo plano, um anunciante por vez, e pode ser
          cancelada.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${all ? "border-primary bg-primary/5" : ""}`}
          >
            <Checkbox
              checked={all}
              onCheckedChange={() => {
                setScope("all");
                resetSimulation();
              }}
              aria-label="Todos os anunciantes"
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Todos os anunciantes</span>
              <span className="text-sm text-muted-foreground">
                {formatarNumero(advertisers.length)} com XML ativo. Quem está há
                mais tempo sem importar vai primeiro.
              </span>
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${!all ? "border-primary bg-primary/5" : ""}`}
          >
            <Checkbox
              checked={!all}
              onCheckedChange={() => {
                setScope("selected");
                resetSimulation();
              }}
              aria-label="Escolher anunciantes"
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Escolher anunciantes</span>
              <span className="text-sm text-muted-foreground">
                Marque um ou mais na lista abaixo. Com um só marcado dá para
                simular antes.
              </span>
            </span>
          </label>
        </div>
      </section>

      {!all && (
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Buscar anunciante"
                placeholder="Buscar por nome, integrador ou ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={integrator} onValueChange={setIntegrator}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Integrador">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_INTEGRATORS}>
                  Todos os integradores
                </SelectItem>
                {integrators.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={recency}
              onValueChange={(v) => setRecency(v as Recency)}
            >
              <SelectTrigger
                className="w-full sm:w-52"
                aria-label="Última importação"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer data</SelectItem>
                <SelectItem value="never">Nunca importados</SelectItem>
                <SelectItem value="7d">Há mais de 7 dias</SelectItem>
                <SelectItem value="30d">Há mais de 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(v) => toggleVisible(v === true)}
                    aria-label="Marcar todos os visíveis"
                    disabled={visible.length === 0}
                  />
                </TableHead>
                <TableHead>Anunciante</TableHead>
                <TableHead>Integrador</TableHead>
                <TableHead>Última importação</TableHead>
                <TableHead>XML</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhum anunciante encontrado com esses filtros.
                  </TableCell>
                </TableRow>
              )}
              {visible.map((a) => {
                const id = `imp-${a.id}`;
                return (
                  <TableRow
                    key={a.id}
                    data-state={selected.has(a.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        id={id}
                        checked={selected.has(a.id)}
                        onCheckedChange={(v) => toggle(a.id, v === true)}
                        aria-label={`Marcar ${a.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Label
                        htmlFor={id}
                        className="cursor-pointer font-medium"
                      >
                        {a.name}
                      </Label>
                      {a.legacy_id != null && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          #{a.legacy_id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.integrator ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.last_imported_at ? (
                        formatarData(a.last_imported_at, true)
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-warning/40 text-warning"
                        >
                          Nunca
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className="max-w-64 truncate font-mono text-xs text-muted-foreground"
                      title={a.xml_url}
                    >
                      {a.xml_url}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3 text-sm">
            <span className="text-muted-foreground">
              {formatarNumero(visible.length)} de{" "}
              {formatarNumero(advertisers.length)} na lista ·{" "}
              <strong className="text-foreground">
                {formatarNumero(selected.size)} marcado(s)
              </strong>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => {
                setSelected(new Set());
                resetSimulation();
              }}
            >
              Limpar seleção
            </Button>
          </div>
        </section>
      )}

      {singleAdvertiser && (simulation || simulating) && (
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">
            Simulação de {singleAdvertiser.name}
          </h2>
          {simulating && !simulation ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Baixando o XML e
              comparando com o banco…
            </p>
          ) : (
            simulation && (
              <div className="mt-4">
                <SimulationResult s={simulation} />
              </div>
            )
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {disabled && (
          <span className="mr-auto text-sm text-muted-foreground">
            Já existe uma importação em andamento. Aguarde ou cancele para
            iniciar outra.
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !single || pending || simulating}
          title={
            single ? undefined : "Marque exatamente um anunciante para simular."
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
          disabled={disabled || count === 0 || pending || simulating}
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
      </div>
    </div>
  );
}

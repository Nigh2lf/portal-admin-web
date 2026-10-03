"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Campo } from "@/components/form/campo";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { limparCache } from "./actions";
import type { EscopoCache } from "./types";

const TODOS = "__todos__";

interface Props {
  portais: Array<{ slug: string; name: string }>;
  escopos: EscopoCache[];
}

export function LimparCache({ portais, escopos }: Props) {
  const [portal, setPortal] = useState(TODOS);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [codigo, setCodigo] = useState("");
  const [erroCodigo, setErroCodigo] = useState<string>();
  const [confirmar, setConfirmar] = useState(false);
  const [pending, start] = useTransition();

  const porImovel = codigo.trim().length > 0;
  const tudo = portal === TODOS && marcados.length === 0 && !porImovel;
  const nomePortal = portais.find((p) => p.slug === portal)?.name;

  const resumo = porImovel
    ? `o imóvel de código ${codigo.trim()}${nomePortal ? ` em ${nomePortal}` : ""}`
    : `${marcados.length ? escopos.filter((e) => marcados.includes(e.value)).map((e) => e.label.split(" (")[0]).join(", ") : "todo o cache"} ${nomePortal ? `de ${nomePortal}` : "de todos os portais"}`;

  const alternar = (valor: string, ligado: boolean) =>
    setMarcados((atual) => (ligado ? [...atual, valor] : atual.filter((v) => v !== valor)));

  const executar = () =>
    start(async () => {
      setErroCodigo(undefined);
      const r = await limparCache({ portal: portal === TODOS ? "" : portal, scopes: porImovel ? [] : marcados, property_code: codigo.trim() });
      setConfirmar(false);
      if (!r.ok) {
        setErroCodigo(r.errors?.property_code?.[0]);
        toast.error(r.message ?? "Não foi possível limpar o cache.");
        return;
      }
      const site = r.data?.site;
      if (site && !site.ok) toast.warning(`Cache da API limpo, mas o site não confirmou: ${site.error || `HTTP ${site.status}`}.`);
      else toast.success(`Limpamos ${resumo}.`);
      setCodigo("");
    });

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (tudo) setConfirmar(true);
        else executar();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="cache-portal" rotulo="Portal">
          <Select value={portal} onValueChange={setPortal}>
            <SelectTrigger id="cache-portal" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os portais</SelectItem>
              {portais.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo id="cache-codigo" rotulo="Código do imóvel" erro={erroCodigo} ajuda="Opcional. Limpa só o detalhe desse imóvel.">
          <Input id="cache-codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: 1326" maxLength={45} aria-invalid={!!erroCodigo} />
        </Campo>
      </div>

      <fieldset className="flex flex-col gap-2" disabled={porImovel}>
        <legend className="mb-1 text-sm font-medium">O que limpar</legend>
        <p className="text-xs text-muted-foreground">
          {porImovel ? "Desativado ao informar o código do imóvel." : "Nenhum marcado limpa tudo do portal escolhido."}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {escopos.map((e) => (
            <label key={e.value} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              <Checkbox checked={marcados.includes(e.value)} onCheckedChange={(v) => alternar(e.value, v === true)} disabled={porImovel} className="mt-0.5" />
              <span>{e.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          <RefreshCw data-icon="inline-start" className={pending ? "animate-spin" : undefined} />
          {pending ? "Limpando…" : "Limpar cache"}
        </Button>
        <p className="text-sm text-muted-foreground">Vai limpar {resumo}.</p>
      </div>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todo o cache?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os portais voltam a buscar os dados no banco. As primeiras visitas ficam mais lentas até o cache se refazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executar} disabled={pending}>
              {pending ? "Limpando…" : "Limpar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

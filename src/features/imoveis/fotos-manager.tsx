"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { definirCapa, enviarFotos, excluirFoto, reordenarFotos } from "./actions";
import type { Foto } from "./types";

interface Props {
  imovelId: string;
  fotosIniciais: Foto[];
  podeEnviar: boolean;
  podeExcluir: boolean;
}

export function FotosManager({ imovelId, fotosIniciais, podeEnviar, podeExcluir }: Props) {
  const [fotos, setFotos] = useState<Foto[]>(fotosIniciais);
  const [selecionadas, setSelecionadas] = useState<File[]>([]);
  const [excluindo, setExcluindo] = useState<Foto | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const aplicar = (r: ActionResult<Foto[]>) => {
    if (r.ok && r.data) {
      setFotos(r.data);
      if (r.message) toast.success(r.message);
    } else {
      toast.error(r.message ?? "Não foi possível concluir a operação.");
    }
    return r.ok;
  };

  const enviar = () =>
    start(async () => {
      if (!selecionadas.length) return;
      const fd = new FormData();
      for (const f of selecionadas) fd.append("images", f);
      if (aplicar(await enviarFotos(imovelId, fd))) {
        setSelecionadas([]);
        if (inputRef.current) inputRef.current.value = "";
      }
    });

  const mover = (indice: number, delta: -1 | 1) =>
    start(async () => {
      const destino = indice + delta;
      if (destino < 0 || destino >= fotos.length) return;
      const ids = fotos.map((f) => f.id);
      [ids[indice], ids[destino]] = [ids[destino]!, ids[indice]!];
      aplicar(await reordenarFotos(imovelId, ids));
    });

  const capa = (foto: Foto) => start(async () => void aplicar(await definirCapa(imovelId, foto.id)));

  const excluir = () =>
    start(async () => {
      if (!excluindo) return;
      if (aplicar(await excluirFoto(imovelId, excluindo.id))) setExcluindo(null);
    });

  return (
    <div className="flex flex-col gap-6">
      {podeEnviar && (
        <section className="rounded-xl border bg-card p-5">
          <header className="mb-3">
            <h2 className="font-semibold">Enviar fotos</h2>
            <p className="text-sm text-muted-foreground">Selecione uma ou mais imagens. Elas entram no fim da ordem; a primeira vira capa se o imóvel ainda não tiver uma.</p>
          </header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input ref={inputRef} type="file" accept="image/*" multiple aria-label="Imagens" onChange={(e) => setSelecionadas(Array.from(e.target.files ?? []))} className="sm:max-w-md" />
            <Button type="button" onClick={enviar} disabled={pending || selecionadas.length === 0}>
              <Upload data-icon="inline-start" /> {pending ? "Enviando…" : `Enviar${selecionadas.length ? ` (${selecionadas.length})` : ""}`}
            </Button>
          </div>
        </section>
      )}

      <section>
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">
            Fotos <span className="text-sm font-normal text-muted-foreground">({fotos.length})</span>
          </h2>
        </header>
        {fotos.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center text-sm text-muted-foreground">Este imóvel ainda não tem fotos.</div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fotos.map((f, i) => (
              <li key={f.id} className={cn("flex flex-col overflow-hidden rounded-xl border bg-card", f.is_cover && "ring-2 ring-primary")}>
                <div className="relative aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL servida pela API; sem otimização do Next. */}
                  <img src={f.thumbnail_url ?? f.image_url} alt={`Foto ${i + 1}`} className="size-full object-cover" loading="lazy" />
                  <span className="absolute top-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium">{i + 1}</span>
                  {f.is_cover && <Badge className="absolute top-2 right-2 gap-1"><Star className="size-3" /> Capa</Badge>}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" disabled={pending || i === 0} onClick={() => mover(i, -1)} aria-label="Mover para cima"><ArrowUp /></Button>
                    <Button type="button" variant="ghost" size="icon-sm" disabled={pending || i === fotos.length - 1} onClick={() => mover(i, 1)} aria-label="Mover para baixo"><ArrowDown /></Button>
                  </div>
                  <div className="flex gap-1">
                    {!f.is_cover && (
                      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => capa(f)}>
                        <Star data-icon="inline-start" /> Capa
                      </Button>
                    )}
                    {podeExcluir && (
                      <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" disabled={pending} onClick={() => setExcluindo(f)} aria-label="Excluir foto"><Trash2 /></Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog open={!!excluindo} onOpenChange={(o) => !o && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta foto?</AlertDialogTitle>
            <AlertDialogDescription>O arquivo será apagado. Se for a capa, a próxima foto assume.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} disabled={pending} className="bg-destructive text-white hover:bg-destructive/90">
              {pending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

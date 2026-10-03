"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  /** Campo base do filtro na API (ex.: `created_at` → `created_at__gte`/`created_at__lte`). */
  campo?: string;
  rotulo?: string;
}

/** Lê o `YYYY-MM-DD` de um datetime ISO guardado na URL. */
function soData(v: string | null) {
  return v ? v.slice(0, 10) : "";
}

/**
 * Par de datas (de/até) refletido na URL como `<campo>__gte=YYYY-MM-DDT00:00:00`
 * e `<campo>__lte=YYYY-MM-DDT23:59:59`, formato aceito pelos filtros da API.
 */
export function FiltroPeriodo({ campo = "created_at", rotulo = "Período" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const chaveDe = `${campo}__gte`;
  const chaveAte = `${campo}__lte`;

  const atualizar = (chave: string, data: string, sufixo: string) => {
    const q = new URLSearchParams(sp.toString());
    if (data) q.set(chave, `${data}${sufixo}`);
    else q.delete(chave);
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{rotulo}</legend>
      <Label htmlFor={`${campo}-de`} className="text-muted-foreground">De</Label>
      <Input
        id={`${campo}-de`}
        type="date"
        className="w-40"
        value={soData(sp.get(chaveDe))}
        max={soData(sp.get(chaveAte)) || undefined}
        onChange={(e) => atualizar(chaveDe, e.target.value, "T00:00:00")}
      />
      <Label htmlFor={`${campo}-ate`} className="text-muted-foreground">até</Label>
      <Input
        id={`${campo}-ate`}
        type="date"
        className="w-40"
        value={soData(sp.get(chaveAte))}
        min={soData(sp.get(chaveDe)) || undefined}
        onChange={(e) => atualizar(chaveAte, e.target.value, "T23:59:59")}
      />
    </fieldset>
  );
}

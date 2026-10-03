"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FiltroSelect {
  nome: string;
  rotulo: string;
  opcoes: Array<{ value: string; label: string }>;
}

/** Busca + filtros refletidos na URL (`?search=&<filtro>=`). */
export function Toolbar({ placeholder = "Buscar…", filtros = [], children }: { placeholder?: string; filtros?: FiltroSelect[]; children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const atualizar = (patch: Record<string, string>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  const temFiltro = sp.get("search") || filtros.some((f) => sp.get(f.nome));

  return (
    <form
      className="mb-4 flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        atualizar({ search: String(new FormData(e.currentTarget).get("search") ?? "") });
      }}
    >
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input name="search" defaultValue={sp.get("search") ?? ""} placeholder={placeholder} className="pl-8" aria-label="Buscar" />
      </div>
      {filtros.map((f) => (
        <Select key={f.nome} value={sp.get(f.nome) ?? ""} onValueChange={(v) => atualizar({ [f.nome]: v === "__todos" ? "" : v })}>
          <SelectTrigger className="w-44" aria-label={f.rotulo}>
            <SelectValue placeholder={f.rotulo} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos">{f.rotulo}: todos</SelectItem>
            {f.opcoes.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      <Button type="submit" variant="secondary">Filtrar</Button>
      {temFiltro && (
        <Button type="button" variant="ghost" onClick={() => router.push(pathname)}>
          <X data-icon="inline-start" /> Limpar
        </Button>
      )}
      {children && <div className="ml-auto flex gap-2">{children}</div>}
    </form>
  );
}

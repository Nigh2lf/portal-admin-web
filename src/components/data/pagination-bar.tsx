"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Paginated } from "@/lib/api/types";

export function PaginationBar({ pagina }: { pagina: Pick<Paginated<unknown>, "count" | "page" | "total_pages" | "page_size"> }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const link = (p: number) => {
    const q = new URLSearchParams(sp.toString());
    q.set("page", String(p));
    return `${pathname}?${q.toString()}`;
  };
  const inicio = pagina.count === 0 ? 0 : (pagina.page - 1) * pagina.page_size + 1;
  const fim = Math.min(pagina.count, pagina.page * pagina.page_size);
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
      <p>
        {inicio}–{fim} de {pagina.count.toLocaleString("pt-BR")}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={pagina.page <= 1}>
          <Link href={link(Math.max(1, pagina.page - 1))} aria-disabled={pagina.page <= 1}>
            <ChevronLeft data-icon="inline-start" /> Anterior
          </Link>
        </Button>
        <span>
          Página {pagina.page} de {Math.max(1, pagina.total_pages)}
        </span>
        <Button asChild variant="outline" size="sm" disabled={pagina.page >= pagina.total_pages}>
          <Link href={link(Math.min(pagina.total_pages, pagina.page + 1))} aria-disabled={pagina.page >= pagina.total_pages}>
            Próxima <ChevronRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

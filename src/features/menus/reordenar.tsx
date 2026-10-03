"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/actions/crud";

/** Botões ↑/↓ que reenviam a ordem completa do portal para `portal-menu-items/reorder/`. */
export function BotoesReordenar({ ids, indice }: { ids: string[]; indice: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const mover = (delta: number) =>
    start(async () => {
      const alvo = indice + delta;
      if (alvo < 0 || alvo >= ids.length) return;
      const nova = [...ids];
      [nova[indice], nova[alvo]] = [nova[alvo]!, nova[indice]!];
      const r = await chamarApi("/portal-menu-items/reorder/", "POST", { ids: nova }, ["/menus"]);
      if (r.ok) router.refresh();
      else toast.error(r.message ?? "Não foi possível reordenar.");
    });
  return (
    <span className="inline-flex gap-1">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Mover para cima" disabled={pending || indice === 0} onClick={() => mover(-1)}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Mover para baixo" disabled={pending || indice === ids.length - 1} onClick={() => mover(1)}>
        <ArrowDown />
      </Button>
    </span>
  );
}

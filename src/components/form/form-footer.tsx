"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FormFooter({ voltarHref, salvando, rotulo = "Salvar" }: { voltarHref: string; salvando: boolean; rotulo?: string }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t pt-4">
      <Button asChild variant="ghost" type="button">
        <Link href={voltarHref}>Cancelar</Link>
      </Button>
      <Button type="submit" disabled={salvando}>
        {salvando ? "Salvando…" : rotulo}
      </Button>
    </div>
  );
}

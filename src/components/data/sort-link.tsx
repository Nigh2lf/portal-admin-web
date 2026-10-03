"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function SortLink({ campo, atual, children }: { campo: string; atual?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const asc = atual === campo;
  const desc = atual === `-${campo}`;
  const proximo = asc ? `-${campo}` : desc ? "" : campo;
  const q = new URLSearchParams(sp.toString());
  if (proximo) q.set("ordering", proximo);
  else q.delete("ordering");
  q.delete("page");
  const Icon = asc ? ArrowUp : desc ? ArrowDown : ArrowUpDown;
  return (
    <Link href={`${pathname}?${q.toString()}`} className="inline-flex items-center gap-1 hover:text-foreground">
      {children}
      <Icon className="size-3.5 opacity-60" aria-hidden />
    </Link>
  );
}

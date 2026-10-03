"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** Item "Ver detalhes" para o slot `extras` de `RowActions` em recursos somente leitura. */
export function AcaoVer({ href }: { href: string }) {
  return (
    <DropdownMenuItem asChild>
      <Link href={href}>
        <Eye /> Ver detalhes
      </Link>
    </DropdownMenuItem>
  );
}

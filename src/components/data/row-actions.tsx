"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { excluirRecurso } from "@/lib/actions/crud";

interface Props {
  editarHref?: string;
  /** Caminho do recurso na API (ex.: `users`) para excluir. */
  recurso?: string;
  id: string;
  rotulo?: string;
  revalidar?: string[];
  podeEditar?: boolean;
  podeExcluir?: boolean;
  extras?: React.ReactNode;
}

export function RowActions({ editarHref, recurso, id, rotulo = "este registro", revalidar = [], podeEditar = true, podeExcluir = true, extras }: Props) {
  const [confirmar, setConfirmar] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const excluir = () =>
    start(async () => {
      if (!recurso) return;
      const r = await excluirRecurso(recurso, id, revalidar);
      if (r.ok) {
        toast.success(r.message ?? "Excluído.");
        setConfirmar(false);
        router.refresh();
      } else toast.error(r.message ?? "Erro ao excluir.");
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Ações">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {editarHref && podeEditar && (
            <DropdownMenuItem asChild>
              <Link href={editarHref}>
                <Pencil /> Editar
              </Link>
            </DropdownMenuItem>
          )}
          {extras}
          {recurso && podeExcluir && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmar(true)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {rotulo}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} disabled={pending} className="bg-destructive text-white hover:bg-destructive/90">
              {pending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { excluirRecurso } from "@/lib/actions/crud";

interface Props {
  /** Caminho do recurso na API (ex.: `property-inquiries`). */
  recurso: string;
  id: string;
  rotulo?: string;
  /** Rota da listagem para onde voltar após excluir. */
  voltarHref: string;
  revalidar?: string[];
  descricao?: string;
}

/** Botão "Excluir" de página de detalhe: confirma em AlertDialog, exclui e volta para a lista. */
export function BotaoExcluir({ recurso, id, rotulo = "este registro", voltarHref, revalidar, descricao = "Esta ação não pode ser desfeita." }: Props) {
  const [aberto, setAberto] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const excluir = () =>
    start(async () => {
      const r = await excluirRecurso(recurso, id, revalidar ?? [voltarHref]);
      if (r.ok) {
        toast.success(r.message ?? "Excluído.");
        setAberto(false);
        router.push(voltarHref);
        router.refresh();
      } else toast.error(r.message ?? "Erro ao excluir.");
    });

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setAberto(true)}>
        <Trash2 data-icon="inline-start" /> Excluir
      </Button>
      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {rotulo}?</AlertDialogTitle>
            <AlertDialogDescription>{descricao}</AlertDialogDescription>
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

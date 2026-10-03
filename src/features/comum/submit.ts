import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import type { ActionResult } from "@/lib/api/types";

/** Trata o `ActionResult` de um formulário: toast + erros nos campos; devolve `true` em sucesso. */
export function tratarResultado<T extends FieldValues>(r: ActionResult<unknown>, setError: UseFormSetError<T>, aoSalvar: () => void): boolean {
  if (r.ok) {
    toast.success(r.message ?? "Salvo.");
    aoSalvar();
    return true;
  }
  aplicarErros(setError, r);
  toast.error(mensagemErro(r));
  return false;
}

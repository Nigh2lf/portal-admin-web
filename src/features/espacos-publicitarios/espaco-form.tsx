"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { paraNumeroOuNulo } from "@/features/comum/helpers";
import { numeroOuNulo } from "@/features/comum/schemas";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import { espacoSchema, type EspacoForm as Valores } from "./schemas";
import { PAGINAS, TIPOS, type EspacoDetalhe } from "./types";

export function EspacoForm({ espaco }: { espaco: EspacoDetalhe | null }) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(espacoSchema),
    defaultValues: {
      code: espaco?.code ?? "",
      name: espaco?.name ?? "",
      page: espaco?.page ?? "HOME",
      kind: espaco?.kind ?? "HORIZONTAL",
      width: espaco?.width ?? 728,
      height: espaco?.height ?? 90,
      monthly_price: paraNumeroOuNulo(espaco?.monthly_price),
      notes: espaco?.notes ?? "",
      is_active: espaco?.is_active ?? true,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<EspacoDetalhe>("ad-placements", espaco?.id ?? null, v, ["/espacos-publicitarios"]);
    tratarResultado(r, setError, () => {
      router.push("/espacos-publicitarios");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Espaço publicitário">
        <Campo id="code" rotulo="Código" erro={errors.code?.message} ajuda="Até 10 caracteres, ex.: PH1, BH1, BL1." obrigatorio>
          <Input id="code" maxLength={10} className="uppercase" {...register("code")} aria-invalid={!!errors.code} />
        </Campo>
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" maxLength={60} {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="page" rotulo="Página" erro={errors.page?.message} obrigatorio>
          <Controller
            control={control}
            name="page"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="page" className="w-full" aria-invalid={!!errors.page}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {PAGINAS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>
        <Campo id="kind" rotulo="Formato" erro={errors.kind?.message} obrigatorio>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="kind" className="w-full" aria-invalid={!!errors.kind}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>
        <Campo id="width" rotulo="Largura (px)" erro={errors.width?.message} obrigatorio>
          <Input id="width" type="number" min="1" {...register("width", { valueAsNumber: true })} aria-invalid={!!errors.width} />
        </Campo>
        <Campo id="height" rotulo="Altura (px)" erro={errors.height?.message} obrigatorio>
          <Input id="height" type="number" min="1" {...register("height", { valueAsNumber: true })} aria-invalid={!!errors.height} />
        </Campo>
        <Campo id="monthly_price" rotulo="Valor mensal (R$)" erro={errors.monthly_price?.message} ajuda="Deixe em branco se não houver preço de tabela.">
          <Input id="monthly_price" type="number" step="0.01" min="0" {...register("monthly_price", { setValueAs: numeroOuNulo })} aria-invalid={!!errors.monthly_price} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
        <Campo id="notes" rotulo="Observações" erro={errors.notes?.message} className="sm:col-span-2">
          <Textarea id="notes" rows={3} maxLength={200} {...register("notes")} aria-invalid={!!errors.notes} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/espacos-publicitarios" salvando={isSubmitting} />
    </form>
  );
}

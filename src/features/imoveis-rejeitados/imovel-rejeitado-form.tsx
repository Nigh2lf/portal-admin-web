"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { SelectLookup } from "@/components/form/select-lookup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { salvarRecurso } from "@/lib/actions/crud";
import { imovelRejeitadoSchema, type ImovelRejeitadoForm as Valores } from "./schemas";
import type { ImovelRejeitadoDetalhe } from "./types";

export function ImovelRejeitadoForm({ registro }: { registro: ImovelRejeitadoDetalhe | null }) {
  const router = useRouter();
  const form = useForm<Valores>({
    resolver: zodResolver(imovelRejeitadoSchema),
    defaultValues: {
      advertiser: registro?.advertiser ?? "",
      property_reference_code: registro?.property_reference_code ?? "",
      reason: registro?.reason ?? "",
    },
  });
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = form;

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<ImovelRejeitadoDetalhe>("rejected-properties", registro?.id ?? null, v, ["/imoveis-rejeitados"]);
    if (r.ok) {
      toast.success(r.message);
      router.push("/imoveis-rejeitados");
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Imóvel rejeitado" descricao="A importação XML pula esta referência enquanto o registro existir.">
        <Campo id="advertiser" rotulo="Anunciante" erro={errors.advertiser?.message} obrigatorio>
          <Controller
            control={control}
            name="advertiser"
            render={({ field }) => <SelectLookup id="advertiser" recurso="advertisers" value={field.value} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o anunciante…" />}
          />
        </Campo>
        <Campo id="property_reference_code" rotulo="Código de referência" erro={errors.property_reference_code?.message} obrigatorio ajuda="Código do imóvel no XML do anunciante.">
          <Input id="property_reference_code" {...register("property_reference_code")} aria-invalid={!!errors.property_reference_code} />
        </Campo>
        <Campo id="reason" rotulo="Motivo" erro={errors.reason?.message} className="sm:col-span-2">
          <Textarea id="reason" rows={3} maxLength={200} {...register("reason")} aria-invalid={!!errors.reason} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/imoveis-rejeitados" salvando={isSubmitting} />
    </form>
  );
}

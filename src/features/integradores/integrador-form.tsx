"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { Input } from "@/components/ui/input";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import { integradorSchema, type IntegradorForm as Valores } from "./schemas";
import type { IntegradorDetalhe } from "./types";

export function IntegradorForm({ integrador }: { integrador: IntegradorDetalhe | null }) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(integradorSchema),
    defaultValues: { name: integrador?.name ?? "", slug: integrador?.slug ?? "", is_active: integrador?.is_active ?? true },
  });

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<IntegradorDetalhe>("integrators", integrador?.id ?? null, v, ["/integradores"]);
    tratarResultado(r, setError, () => {
      router.push("/integradores");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Integrador" descricao="Sistemas que fornecem XML/CRM de imóveis (Vista, VivaReal, Union…).">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Identificador único (ex.: vista)." obrigatorio>
          <Input id="slug" {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
      </FormSecao>
      <FormFooter voltarHref="/integradores" salvando={isSubmitting} />
    </form>
  );
}

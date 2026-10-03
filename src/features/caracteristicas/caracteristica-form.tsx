"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import { caracteristicaSchema, type CaracteristicaForm as Valores } from "./schemas";
import { ESCOPOS, type CaracteristicaDetalhe } from "./types";

export function CaracteristicaForm({ caracteristica }: { caracteristica: CaracteristicaDetalhe | null }) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(caracteristicaSchema),
    defaultValues: {
      scope: caracteristica?.scope ?? "PROPERTY",
      name: caracteristica?.name ?? "",
      slug: caracteristica?.slug ?? "",
      is_active: caracteristica?.is_active ?? true,
      sort_order: caracteristica?.sort_order ?? 0,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<CaracteristicaDetalhe>("features", caracteristica?.id ?? null, v, ["/caracteristicas"]);
    tratarResultado(r, setError, () => {
      router.push("/caracteristicas");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Escopo" descricao="Define se a característica pertence ao imóvel ou ao condomínio.">
        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
              {ESCOPOS.map((e) => (
                <label key={e.value} htmlFor={`scope-${e.value}`} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                  <RadioGroupItem id={`scope-${e.value}`} value={e.value} className="mt-0.5" />
                  <span>
                    <span className="block font-medium">{e.label}</span>
                    <span className="block text-sm text-muted-foreground">{e.descricao}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.scope?.message && <p className="text-xs text-destructive sm:col-span-2" role="alert">{errors.scope.message}</p>}
      </FormSecao>

      <FormSecao titulo="Característica">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Deixe em branco para gerar a partir do nome. Único dentro do escopo.">
          <Input id="slug" placeholder="gerado automaticamente" {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <Campo id="sort_order" rotulo="Ordem de exibição" erro={errors.sort_order?.message}>
          <Input id="sort_order" type="number" min="0" {...register("sort_order", { valueAsNumber: true })} aria-invalid={!!errors.sort_order} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativa", "Inativa"]} />
      </FormSecao>
      <FormFooter voltarHref="/caracteristicas" salvando={isSubmitting} />
    </form>
  );
}

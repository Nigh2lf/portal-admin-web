"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { Input } from "@/components/ui/input";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { paraNumeroOuNulo } from "@/features/comum/helpers";
import { numeroOuNulo } from "@/features/comum/schemas";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import { planoSchema, type PlanoForm as Valores } from "./schemas";
import type { PlanoDetalhe } from "./types";

export function PlanoForm({ plano }: { plano: PlanoDetalhe | null }) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      name: plano?.name ?? "",
      slug: plano?.slug ?? "",
      monthly_price: paraNumeroOuNulo(plano?.monthly_price),
      property_limit: plano?.property_limit ?? 0,
      photo_limit: plano?.photo_limit ?? 0,
      featured_limit: plano?.featured_limit ?? 0,
      has_realtor_page: plano?.has_realtor_page ?? false,
      receives_property_requests: plano?.receives_property_requests ?? false,
      has_hotsite: plano?.has_hotsite ?? false,
      is_owner_only: plano?.is_owner_only ?? false,
      is_recommended: plano?.is_recommended ?? false,
      is_active: plano?.is_active ?? true,
      sort_order: plano?.sort_order ?? 0,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<PlanoDetalhe>("plans", plano?.id ?? null, v, ["/planos"]);
    tratarResultado(r, setError, () => {
      router.push("/planos");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Plano">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Identificador único usado em URLs." obrigatorio>
          <Input id="slug" {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <Campo id="monthly_price" rotulo="Mensalidade (R$)" erro={errors.monthly_price?.message} ajuda="Deixe em branco para exibir “sob consulta”.">
          <Input id="monthly_price" type="number" step="0.01" min="0" placeholder="Sob consulta" {...register("monthly_price", { setValueAs: numeroOuNulo })} aria-invalid={!!errors.monthly_price} />
        </Campo>
        <Campo id="sort_order" rotulo="Ordem de exibição" erro={errors.sort_order?.message}>
          <Input id="sort_order" type="number" min="0" {...register("sort_order", { valueAsNumber: true })} aria-invalid={!!errors.sort_order} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
        <CampoSwitch control={control} name="is_recommended" rotulo="Plano recomendado" textos={["Destacado como recomendado", "Sem destaque"]} />
      </FormSecao>

      <FormSecao titulo="Limites">
        <Campo id="property_limit" rotulo="Limite de imóveis" erro={errors.property_limit?.message} obrigatorio>
          <Input id="property_limit" type="number" min="0" {...register("property_limit", { valueAsNumber: true })} aria-invalid={!!errors.property_limit} />
        </Campo>
        <Campo id="photo_limit" rotulo="Fotos por imóvel" erro={errors.photo_limit?.message} obrigatorio>
          <Input id="photo_limit" type="number" min="0" {...register("photo_limit", { valueAsNumber: true })} aria-invalid={!!errors.photo_limit} />
        </Campo>
        <Campo id="featured_limit" rotulo="Imóveis em destaque" erro={errors.featured_limit?.message}>
          <Input id="featured_limit" type="number" min="0" {...register("featured_limit", { valueAsNumber: true })} aria-invalid={!!errors.featured_limit} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Recursos incluídos">
        <CampoSwitch control={control} name="has_realtor_page" rotulo="Página da imobiliária" />
        <CampoSwitch control={control} name="receives_property_requests" rotulo="Recebe encomendas de imóveis" />
        <CampoSwitch control={control} name="has_hotsite" rotulo="Hotsite" />
        <CampoSwitch control={control} name="is_owner_only" rotulo="Exclusivo para proprietários" textos={["Sim, só proprietários", "Não"]} />
      </FormSecao>

      <FormFooter voltarHref="/planos" salvando={isSubmitting} />
    </form>
  );
}

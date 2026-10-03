"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { linhasParaLista, listaParaLinhas } from "@/features/comum/helpers";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import { tipoImovelSchema, type TipoImovelForm as Valores } from "./schemas";
import type { TipoImovelDetalhe } from "./types";

export function TipoImovelForm({ tipo }: { tipo: TipoImovelDetalhe | null }) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(tipoImovelSchema),
    defaultValues: {
      name: tipo?.name ?? "",
      slug: tipo?.slug ?? "",
      import_aliases: listaParaLinhas(tipo?.import_aliases),
      mercadolivre_category: tipo?.mercadolivre_category ?? "",
      is_residential: tipo?.is_residential ?? true,
      is_active: tipo?.is_active ?? true,
      sort_order: tipo?.sort_order ?? 0,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const body = { ...v, import_aliases: linhasParaLista(v.import_aliases) };
    const r = await salvarRecurso<TipoImovelDetalhe>("property-types", tipo?.id ?? null, body, ["/tipos-de-imovel"]);
    tratarResultado(r, setError, () => {
      router.push("/tipos-de-imovel");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Tipo de imóvel">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Deixe em branco para gerar a partir do nome.">
          <Input id="slug" placeholder="gerado automaticamente" {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <Campo id="mercadolivre_category" rotulo="Categoria no Mercado Livre" erro={errors.mercadolivre_category?.message} ajuda="Código da categoria usado na exportação (opcional).">
          <Input id="mercadolivre_category" {...register("mercadolivre_category")} aria-invalid={!!errors.mercadolivre_category} />
        </Campo>
        <Campo id="sort_order" rotulo="Ordem de exibição" erro={errors.sort_order?.message}>
          <Input id="sort_order" type="number" min="0" {...register("sort_order", { valueAsNumber: true })} aria-invalid={!!errors.sort_order} />
        </Campo>
        <CampoSwitch control={control} name="is_residential" rotulo="Residencial" textos={["Sim: exibe quartos, suítes e banheiros", "Não: imóvel comercial/terreno"]} />
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
        <Campo id="import_aliases" rotulo="Nomes aceitos na importação XML" erro={errors.import_aliases?.message} ajuda="Um por linha." className="sm:col-span-2">
          <Textarea id="import_aliases" rows={4} {...register("import_aliases")} aria-invalid={!!errors.import_aliases} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/tipos-de-imovel" salvando={isSubmitting} />
    </form>
  );
}

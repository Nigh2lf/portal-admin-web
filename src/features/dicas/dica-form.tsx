"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { SelectLookup } from "@/components/form/select-lookup";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { datetimeLocalParaIso, isoParaDatetimeLocal } from "@/features/compartilhado/datas";
import { salvarRecurso } from "@/lib/actions/crud";
import type { DicaDetalhe } from "./types";

const schema = z.object({
  portal: z.string().nullable(),
  title: z.string().trim().min(2, "Informe o título.").max(150, "Máximo de 150 caracteres."),
  body: z.string().trim().min(1, "Informe o conteúdo."),
  is_active: z.boolean(),
  published_at: z.string(),
  sort_order: z.number({ error: "Informe um número inteiro." }).int("Informe um número inteiro.").min(0, "Não pode ser negativo."),
});
type Valores = z.infer<typeof schema>;

export function DicaForm({ dica }: { dica: DicaDetalhe | null }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: {
      portal: dica?.portal ?? null,
      title: dica?.title ?? "",
      body: dica?.body ?? "",
      is_active: dica?.is_active ?? true,
      published_at: isoParaDatetimeLocal(dica?.published_at),
      sort_order: dica?.sort_order ?? 0,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const body = { ...v, published_at: datetimeLocalParaIso(v.published_at) };
    const r = await salvarRecurso<DicaDetalhe>("tips", dica?.id ?? null, body, ["/dicas"]);
    if (r.ok) {
      toast.success(r.message);
      router.push("/dicas");
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Dica">
        <Campo id="title" rotulo="Título" erro={errors.title?.message} obrigatorio className="sm:col-span-2">
          <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
        </Campo>
        <Campo id="portal" rotulo="Portal" erro={errors.portal?.message} ajuda="Deixe em branco para exibir em todos os portais.">
          <Controller
            control={control}
            name="portal"
            render={({ field }) => <SelectLookup id="portal" recurso="portals" value={field.value} onChange={field.onChange} placeholder="Todos os portais" />}
          />
        </Campo>
        <Campo id="sort_order" rotulo="Ordem" erro={errors.sort_order?.message} ajuda="Menor número aparece primeiro.">
          <Input id="sort_order" type="number" min={0} step={1} {...register("sort_order", { valueAsNumber: true })} aria-invalid={!!errors.sort_order} />
        </Campo>
        <Campo id="body" rotulo="Conteúdo" erro={errors.body?.message} obrigatorio ajuda="Aceita HTML simples (parágrafos, negrito, links)." className="sm:col-span-2">
          <Textarea id="body" rows={10} className="min-h-48 font-mono text-sm" {...register("body")} aria-invalid={!!errors.body} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Publicação">
        <Campo id="published_at" rotulo="Publicada em" erro={errors.published_at?.message} ajuda="Opcional. Data e hora de publicação.">
          <Input id="published_at" type="datetime-local" {...register("published_at")} aria-invalid={!!errors.published_at} />
        </Campo>
        <Campo id="is_active" rotulo="Status">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label className="flex h-8 items-center gap-3 text-sm">
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                {field.value ? "Ativa: visível no portal" : "Inativa: oculta"}
              </label>
            )}
          />
        </Campo>
      </FormSecao>

      <FormFooter voltarHref="/dicas" salvando={isSubmitting} />
    </form>
  );
}

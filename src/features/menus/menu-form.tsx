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
import { salvarRecurso } from "@/lib/actions/crud";
import type { MenuItemDetalhe } from "./types";

const schema = z.object({
  portal: z.string().min(1, "Selecione o portal."),
  label: z.string().trim().min(1, "Informe o rótulo.").max(60, "Máximo de 60 caracteres."),
  path: z
    .string()
    .trim()
    .min(1, "Informe o caminho.")
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Comece com / (ex.: /imoveis) ou informe uma URL completa."),
  sort_order: z.number({ error: "Informe um número inteiro." }).int().min(0, "Não pode ser negativo."),
  is_active: z.boolean(),
});
type Valores = z.infer<typeof schema>;

export function MenuForm({ item, portalInicial }: { item: MenuItemDetalhe | null; portalInicial?: string }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: {
      portal: item?.portal ?? portalInicial ?? "",
      label: item?.label ?? "",
      path: item?.path ?? "/",
      sort_order: item?.sort_order ?? 0,
      is_active: item?.is_active ?? true,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<MenuItemDetalhe>("portal-menu-items", item?.id ?? null, v, ["/menus"]);
    if (r.ok) {
      toast.success(r.message);
      router.push(`/menus?portal=${v.portal}`);
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <FormSecao titulo="Item de menu" descricao="Aparece no cabeçalho do site do portal, na ordem definida.">
        <Campo id="portal" rotulo="Portal" erro={errors.portal?.message} obrigatorio className="sm:col-span-2">
          <Controller control={control} name="portal" render={({ field }) => (
            <SelectLookup id="portal" recurso="portals" value={field.value || null} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o portal" />
          )} />
        </Campo>
        <Campo id="label" rotulo="Rótulo" erro={errors.label?.message} obrigatorio>
          <Input id="label" maxLength={60} placeholder="Ex.: Imóveis" {...register("label")} aria-invalid={!!errors.label} />
        </Campo>
        <Campo id="path" rotulo="Caminho" erro={errors.path?.message} ajuda="Rota do site (/imoveis) ou URL completa." obrigatorio>
          <Input id="path" maxLength={200} placeholder="/imoveis" {...register("path")} aria-invalid={!!errors.path} />
        </Campo>
        <Campo id="sort_order" rotulo="Ordem" erro={errors.sort_order?.message} ajuda="Menor aparece primeiro.">
          <Input id="sort_order" type="number" min={0} step={1} {...register("sort_order", { valueAsNumber: true })} aria-invalid={!!errors.sort_order} />
        </Campo>
        <Campo id="is_active" rotulo="Status">
          <Controller control={control} name="is_active" render={({ field }) => (
            <label className="flex h-9 items-center gap-3 text-sm">
              <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
              {field.value ? "Visível no site" : "Oculto"}
            </label>
          )} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/menus" salvando={isSubmitting} />
    </form>
  );
}

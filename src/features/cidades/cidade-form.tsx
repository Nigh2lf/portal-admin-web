"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { SelectLookup } from "@/components/form/select-lookup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { linhasParaLista, listaParaLinhas } from "@/features/comum/helpers";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecurso } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";
import { cidadeSchema, type CidadeForm as Valores } from "./schemas";
import type { CidadeDetalhe } from "./types";

export function CidadeForm({ cidade, estados }: { cidade: CidadeDetalhe | null; estados: LookupOption[] }) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(cidadeSchema),
    defaultValues: {
      state: cidade?.state ?? "",
      name: cidade?.name ?? "",
      slug: cidade?.slug ?? "",
      import_aliases: listaParaLinhas(cidade?.import_aliases),
      is_active: cidade?.is_active ?? true,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const body = { ...v, import_aliases: linhasParaLista(v.import_aliases) };
    const r = await salvarRecurso<CidadeDetalhe>("cities", cidade?.id ?? null, body, ["/cidades"]);
    tratarResultado(r, setError, () => {
      router.push("/cidades");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Dados da cidade">
        <Campo id="state" rotulo="Estado" erro={errors.state?.message} obrigatorio>
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <SelectLookup id="state" recurso="states" opcoesIniciais={estados} value={field.value || null} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o estado…" />
            )}
          />
        </Campo>
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Deixe em branco para gerar a partir do nome. Único dentro do estado.">
          <Input id="slug" placeholder="gerado automaticamente" {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativa", "Inativa"]} />
        <Campo id="import_aliases" rotulo="Nomes aceitos na importação XML" erro={errors.import_aliases?.message} ajuda="Um por linha. Variações de grafia que devem ser reconhecidas como esta cidade." className="sm:col-span-2">
          <Textarea id="import_aliases" rows={4} {...register("import_aliases")} aria-invalid={!!errors.import_aliases} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/cidades" salvando={isSubmitting} />
    </form>
  );
}

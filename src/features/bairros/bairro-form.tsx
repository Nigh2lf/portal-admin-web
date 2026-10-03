"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { bairroSchema, type BairroForm as Valores } from "./schemas";
import type { BairroDetalhe } from "./types";

interface Props {
  bairro: BairroDetalhe | null;
  estados: LookupOption[];
  /** UUID do estado da cidade atual (a API só devolve `state_code` no bairro). */
  estadoInicial: string | null;
}

export function BairroForm({ bairro, estados, estadoInicial }: Props) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, setValue, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(bairroSchema),
    defaultValues: {
      estado: estadoInicial ?? "",
      city: bairro?.city ?? "",
      name: bairro?.name ?? "",
      slug: bairro?.slug ?? "",
      import_aliases: listaParaLinhas(bairro?.import_aliases),
      is_active: bairro?.is_active ?? true,
    },
  });
  const estado = useWatch({ control, name: "estado" });

  const onSubmit = handleSubmit(async (v) => {
    const { estado: _e, ...resto } = v;
    void _e;
    const body = { ...resto, import_aliases: linhasParaLista(v.import_aliases) };
    const r = await salvarRecurso<BairroDetalhe>("neighborhoods", bairro?.id ?? null, body, ["/bairros"]);
    tratarResultado(r, setError, () => {
      router.push("/bairros");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Localização">
        <Campo id="estado" rotulo="Estado" ajuda="Filtra a lista de cidades.">
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <SelectLookup
                id="estado"
                recurso="states"
                opcoesIniciais={estados}
                value={field.value || null}
                onChange={(v) => {
                  field.onChange(v ?? "");
                  setValue("city", "", { shouldDirty: true });
                }}
                permitirVazio={false}
                placeholder="Selecione o estado…"
              />
            )}
          />
        </Campo>
        <Campo id="city" rotulo="Cidade" erro={errors.city?.message} obrigatorio>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <SelectLookup
                id="city"
                recurso="cities"
                params={estado ? { state: estado } : undefined}
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? "")}
                permitirVazio={false}
                placeholder={estado ? "Selecione a cidade…" : "Selecione o estado primeiro"}
                disabled={!estado}
              />
            )}
          />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Dados do bairro">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Deixe em branco para gerar a partir do nome. Único dentro da cidade.">
          <Input id="slug" placeholder="gerado automaticamente" {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
        <Campo id="import_aliases" rotulo="Nomes aceitos na importação XML" erro={errors.import_aliases?.message} ajuda="Um por linha." className="sm:col-span-2">
          <Textarea id="import_aliases" rows={4} {...register("import_aliases")} aria-invalid={!!errors.import_aliases} />
        </Campo>
      </FormSecao>
      <FormFooter voltarHref="/bairros" salvando={isSubmitting} />
    </form>
  );
}

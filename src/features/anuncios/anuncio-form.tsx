"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { SelectLookup } from "@/components/form/select-lookup";
import { Input } from "@/components/ui/input";
import { CampoImagem } from "@/features/comum/campo-imagem";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { paraDatetimeLocal } from "@/features/comum/helpers";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecursoMultipart } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";
import { anuncioSchema, type AnuncioForm as Valores } from "./schemas";
import type { AnuncioDetalhe } from "./types";

interface Props {
  anuncio: AnuncioDetalhe | null;
  portais: LookupOption[];
  espacos: LookupOption[];
}

export function AnuncioForm({ anuncio, portais, espacos }: Props) {
  const router = useRouter();
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(anuncioSchema(!anuncio)),
    defaultValues: {
      portal: anuncio?.portal ?? "",
      placement: anuncio?.placement ?? "",
      name: anuncio?.name ?? "",
      image: null,
      link_url: anuncio?.link_url ?? "",
      open_in_new_tab: anuncio?.open_in_new_tab ?? false,
      starts_at: paraDatetimeLocal(anuncio?.starts_at),
      ends_at: paraDatetimeLocal(anuncio?.ends_at),
      is_active: anuncio?.is_active ?? true,
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const fd = new FormData();
    fd.append("portal", v.portal);
    fd.append("placement", v.placement);
    fd.append("name", v.name);
    fd.append("link_url", v.link_url);
    fd.append("open_in_new_tab", v.open_in_new_tab ? "true" : "false");
    fd.append("starts_at", v.starts_at);
    fd.append("ends_at", v.ends_at);
    fd.append("is_active", v.is_active ? "true" : "false");
    if (v.image) fd.append("image", v.image);
    const r = await salvarRecursoMultipart<AnuncioDetalhe>("ads", anuncio?.id ?? null, fd, ["/anuncios"]);
    tratarResultado(r, setError, () => {
      router.push("/anuncios");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Onde exibir">
        <Campo id="portal" rotulo="Portal" erro={errors.portal?.message} obrigatorio>
          <Controller
            control={control}
            name="portal"
            render={({ field }) => (
              <SelectLookup id="portal" recurso="portals" opcoesIniciais={portais} value={field.value || null} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o portal…" />
            )}
          />
        </Campo>
        <Campo id="placement" rotulo="Espaço publicitário" erro={errors.placement?.message} obrigatorio>
          <Controller
            control={control}
            name="placement"
            render={({ field }) => (
              <SelectLookup id="placement" recurso="ad-placements" opcoesIniciais={espacos} value={field.value || null} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o espaço…" />
            )}
          />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Anúncio">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} ajuda="Identificação interna do anúncio." obrigatorio>
          <Input id="name" maxLength={100} {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="link_url" rotulo="Link de destino" erro={errors.link_url?.message} ajuda="Opcional. Ex.: https://anunciante.com.br">
          <Input id="link_url" type="url" placeholder="https://" {...register("link_url")} aria-invalid={!!errors.link_url} />
        </Campo>
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <CampoImagem
              id="image"
              rotulo="Imagem"
              urlAtual={anuncio?.image_url}
              arquivo={field.value}
              onArquivo={field.onChange}
              erro={errors.image?.message}
              ajuda={anuncio ? "Selecione um arquivo apenas para substituir a imagem atual." : "Respeite as dimensões do espaço publicitário."}
              obrigatorio={!anuncio}
              className="sm:col-span-2"
            />
          )}
        />
        <CampoSwitch control={control} name="open_in_new_tab" rotulo="Abrir link em nova aba" />
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
      </FormSecao>

      <FormSecao titulo="Período de veiculação">
        <Campo id="starts_at" rotulo="Início" erro={errors.starts_at?.message} obrigatorio>
          <Input id="starts_at" type="datetime-local" {...register("starts_at")} aria-invalid={!!errors.starts_at} />
        </Campo>
        <Campo id="ends_at" rotulo="Fim" erro={errors.ends_at?.message} obrigatorio>
          <Input id="ends_at" type="datetime-local" {...register("ends_at")} aria-invalid={!!errors.ends_at} />
        </Campo>
      </FormSecao>

      <FormFooter voltarHref="/anuncios" salvando={isSubmitting} />
    </form>
  );
}

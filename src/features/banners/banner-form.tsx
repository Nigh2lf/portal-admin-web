"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { SelectLookup } from "@/components/form/select-lookup";
import { CampoImagem } from "@/features/comum/campo-imagem";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { tratarResultado } from "@/features/comum/submit";
import { salvarRecursoMultipart } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";
import { bannerSchema, type BannerForm as Valores } from "./schemas";
import type { BannerDetalhe } from "./types";

export function BannerForm({ banner, portais }: { banner: BannerDetalhe | null; portais: LookupOption[] }) {
  const router = useRouter();
  const { handleSubmit, control, setError, setValue, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(bannerSchema(!banner)),
    defaultValues: { portal: banner?.portal ?? null, home_image: null, inner_image: null, remover_inner_image: false, is_active: banner?.is_active ?? true },
  });
  const removerInner = useWatch({ control, name: "remover_inner_image" });

  const onSubmit = handleSubmit(async (v) => {
    const fd = new FormData();
    // Vazio = sem portal (vale para todos). A API trata "" como null em multipart.
    fd.append("portal", v.portal ?? "");
    fd.append("is_active", v.is_active ? "true" : "false");
    if (v.home_image) fd.append("home_image", v.home_image);
    if (v.inner_image) fd.append("inner_image", v.inner_image);
    else if (v.remover_inner_image) fd.append("inner_image", "");
    const r = await salvarRecursoMultipart<BannerDetalhe>("banners", banner?.id ?? null, fd, ["/banners"]);
    tratarResultado(r, setError, () => {
      router.push("/banners");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <FormSecao titulo="Banner" descricao="Imagens de fundo do hero da home e do topo das páginas internas.">
        <Campo id="portal" rotulo="Portal" erro={errors.portal?.message} ajuda="Deixe em branco para valer em todos os portais.">
          <Controller
            control={control}
            name="portal"
            render={({ field }) => (
              <SelectLookup id="portal" recurso="portals" opcoesIniciais={portais} value={field.value} onChange={field.onChange} placeholder="Todos os portais" />
            )}
          />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
        <Controller
          control={control}
          name="home_image"
          render={({ field }) => (
            <CampoImagem
              id="home_image"
              rotulo="Imagem da home (hero)"
              urlAtual={banner?.home_image_url}
              arquivo={field.value}
              onArquivo={field.onChange}
              erro={errors.home_image?.message}
              ajuda={banner ? "Selecione um arquivo apenas para substituir a imagem atual." : "Imagem larga, em alta resolução."}
              obrigatorio={!banner}
              className="sm:col-span-2"
            />
          )}
        />
        <Controller
          control={control}
          name="inner_image"
          render={({ field }) => (
            <CampoImagem
              id="inner_image"
              rotulo="Imagem das páginas internas"
              urlAtual={banner?.inner_image_url}
              arquivo={field.value}
              onArquivo={field.onChange}
              removido={removerInner}
              onRemover={(r) => setValue("remover_inner_image", r, { shouldDirty: true })}
              erro={errors.inner_image?.message}
              ajuda="Opcional. Quando ausente, o portal usa a imagem da home."
              className="sm:col-span-2"
            />
          )}
        />
      </FormSecao>
      <FormFooter voltarHref="/banners" salvando={isSubmitting} />
    </form>
  );
}

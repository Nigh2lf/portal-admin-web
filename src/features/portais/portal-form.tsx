"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { SelectLookup } from "@/components/form/select-lookup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CampoImagem } from "@/features/comum/campo-imagem";
import { CampoSwitch } from "@/features/comum/campo-switch";
import { linhasParaLista, listaParaLinhas } from "@/features/comum/helpers";
import { salvarRecurso, salvarRecursoMultipart } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";
import { portalSchema, type PortalForm as Valores } from "./schemas";
import { IMAGENS_PORTAL, POSICOES_MARCA_DAGUA, ROTULO_IMAGEM, type PortalDetalhe } from "./types";

interface Props {
  portal: PortalDetalhe | null;
  /** Cidades ativas (`cities/lookup/`). */
  cidades: LookupOption[];
  /** Portais ativos (`portals/lookup/`), já sem o próprio portal. */
  portais: LookupOption[];
}

export function PortalForm({ portal, cidades, portais }: Props) {
  const router = useRouter();
  const form = useForm<Valores>({
    resolver: zodResolver(portalSchema),
    defaultValues: {
      slug: portal?.slug ?? "",
      name: portal?.name ?? "",
      domain: portal?.domain ?? "",
      extra_domains: listaParaLinhas(portal?.extra_domains),
      is_active: portal?.is_active ?? true,
      main_city: portal?.main_city ?? "",
      show_city_filter: portal?.show_city_filter ?? false,
      cities: portal?.cities ?? [],
      combined_portals: portal?.combined_portals ?? [],
      email: portal?.email ?? "",
      phone: portal?.phone ?? "",
      whatsapp: portal?.whatsapp ?? "",
      address: portal?.address ?? "",
      seo_title: portal?.seo_title ?? "",
      seo_description: portal?.seo_description ?? "",
      seo_keywords: portal?.seo_keywords ?? "",
      about_text: portal?.about_text ?? "",
      facebook_url: portal?.facebook_url ?? "",
      instagram_url: portal?.instagram_url ?? "",
      ga4_measurement_id: portal?.ga4_measurement_id ?? "",
      recaptcha_site_key: portal?.recaptcha_site_key ?? "",
      logo: null,
      logo_mobile: null,
      og_image: null,
      watermark: null,
      remover_logo: false,
      remover_logo_mobile: false,
      remover_og_image: false,
      remover_watermark: false,
      primary_color: portal?.primary_color ?? "",
      secondary_color: portal?.secondary_color ?? "",
      realtors_page_slug: portal?.realtors_page_slug ?? "imobiliarias",
      results_per_page: portal?.results_per_page ?? 30,
      thumbnail_max_width: portal?.thumbnail_max_width ?? 360,
      thumbnail_max_height: portal?.thumbnail_max_height ?? 230,
      watermark_position: portal?.watermark_position ?? 9,
      menu_items: (portal?.menu_items ?? []).map((m) => ({ label: m.label, path: m.path, sort_order: m.sort_order, is_active: m.is_active })),
    },
  });
  const { register, handleSubmit, control, setError, setValue, formState: { errors, isSubmitting } } = form;
  const menu = useFieldArray({ control, name: "menu_items" });
  const removidos = useWatch({ control, name: ["remover_logo", "remover_logo_mobile", "remover_og_image", "remover_watermark"] });

  const onSubmit = handleSubmit(async (v) => {
    const { logo, logo_mobile, og_image, watermark, remover_logo, remover_logo_mobile, remover_og_image, remover_watermark, extra_domains, menu_items, ...resto } = v;
    const body: Record<string, unknown> = {
      ...resto,
      extra_domains: linhasParaLista(extra_domains),
      menu_items: menu_items.map((m, i) => ({ ...m, sort_order: i })),
    };
    // Imagens marcadas para remoção vão como `null` no JSON; novas imagens vão depois em multipart.
    const arquivos: Array<[string, File | null]> = [["logo", logo], ["logo_mobile", logo_mobile], ["og_image", og_image], ["watermark", watermark]];
    const remover: Record<string, boolean> = { logo: remover_logo, logo_mobile: remover_logo_mobile, og_image: remover_og_image, watermark: remover_watermark };
    for (const [campo, arquivo] of arquivos) if (remover[campo] && !arquivo) body[campo] = null;

    const r = await salvarRecurso<PortalDetalhe>("portals", portal?.id ?? null, body, ["/portais"]);
    if (!r.ok) {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
      return;
    }
    const id = portal?.id ?? r.data?.id;
    const novos = arquivos.filter((a): a is [string, File] => a[1] instanceof File);
    if (novos.length && id) {
      const fd = new FormData();
      for (const [campo, arquivo] of novos) fd.append(campo, arquivo);
      const r2 = await salvarRecursoMultipart<PortalDetalhe>("portals", id, fd, ["/portais", `/portais/${id}`]);
      if (!r2.ok) {
        aplicarErros(setError, r2);
        toast.error(`Dados salvos, mas houve erro ao enviar as imagens: ${mensagemErro(r2)}`);
        if (!portal) router.push(`/portais/${id}`);
        return;
      }
    }
    toast.success(r.message ?? "Portal salvo.");
    router.push("/portais");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-4xl flex-col gap-6">
      <FormSecao titulo="Identidade" descricao="Nome, domínio e abrangência geográfica do portal.">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" maxLength={100} {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Identificador único (ex.: imoveis-rio)." obrigatorio>
          <Input id="slug" maxLength={40} {...register("slug")} aria-invalid={!!errors.slug} />
        </Campo>
        <Campo id="domain" rotulo="Domínio principal" erro={errors.domain?.message} ajuda="Sem protocolo, ex.: www.portal.com.br" obrigatorio>
          <Input id="domain" maxLength={120} {...register("domain")} aria-invalid={!!errors.domain} />
        </Campo>
        <CampoSwitch control={control} name="is_active" rotulo="Status" textos={["Ativo", "Inativo"]} />
        <Campo id="extra_domains" rotulo="Domínios adicionais" erro={errors.extra_domains?.message} ajuda="Um por linha. Redirecionam para o domínio principal." className="sm:col-span-2">
          <Textarea id="extra_domains" rows={3} {...register("extra_domains")} aria-invalid={!!errors.extra_domains} />
        </Campo>
        <Campo id="main_city" rotulo="Cidade principal" erro={errors.main_city?.message} obrigatorio>
          <Controller
            control={control}
            name="main_city"
            render={({ field }) => (
              <SelectLookup id="main_city" recurso="cities" opcoesIniciais={cidades} value={field.value || null} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione a cidade…" />
            )}
          />
        </Campo>
        <CampoSwitch control={control} name="show_city_filter" rotulo="Filtro de cidade na busca" textos={["Exibir filtro de cidade", "Ocultar filtro de cidade"]} />
        <Controller
          control={control}
          name="cities"
          render={({ field }) => (
            <ListaCheckbox
              id="cities"
              rotulo="Cidades atendidas"
              ajuda="Cidades cujos imóveis aparecem neste portal."
              opcoes={cidades}
              value={field.value}
              onChange={field.onChange}
              vazio="Nenhuma cidade ativa cadastrada."
              erro={errors.cities?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="combined_portals"
          render={({ field }) => (
            <ListaCheckbox
              id="combined_portals"
              rotulo="Portais combinados"
              ajuda="Os imóveis destes portais também são exibidos aqui."
              opcoes={portais}
              value={field.value}
              onChange={field.onChange}
              vazio="Nenhum outro portal ativo."
              erro={errors.combined_portals?.message}
            />
          )}
        />
      </FormSecao>

      <FormSecao titulo="Contato">
        <Campo id="email" rotulo="E-mail" erro={errors.email?.message} obrigatorio>
          <Input id="email" type="email" maxLength={120} {...register("email")} aria-invalid={!!errors.email} />
        </Campo>
        <Campo id="phone" rotulo="Telefone" erro={errors.phone?.message}>
          <Input id="phone" maxLength={30} {...register("phone")} aria-invalid={!!errors.phone} />
        </Campo>
        <Campo id="whatsapp" rotulo="WhatsApp" erro={errors.whatsapp?.message} ajuda="Com DDD, ex.: 21999990000">
          <Input id="whatsapp" maxLength={30} {...register("whatsapp")} aria-invalid={!!errors.whatsapp} />
        </Campo>
        <Campo id="address" rotulo="Endereço" erro={errors.address?.message}>
          <Input id="address" maxLength={300} {...register("address")} aria-invalid={!!errors.address} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="SEO">
        <Campo id="seo_title" rotulo="Título (title)" erro={errors.seo_title?.message} obrigatorio className="sm:col-span-2">
          <Input id="seo_title" maxLength={200} {...register("seo_title")} aria-invalid={!!errors.seo_title} />
        </Campo>
        <Campo id="seo_description" rotulo="Descrição (meta description)" erro={errors.seo_description?.message} ajuda="Até 320 caracteres." obrigatorio className="sm:col-span-2">
          <Textarea id="seo_description" rows={2} maxLength={320} {...register("seo_description")} aria-invalid={!!errors.seo_description} />
        </Campo>
        <Campo id="seo_keywords" rotulo="Palavras-chave" erro={errors.seo_keywords?.message} ajuda="Separadas por vírgula." className="sm:col-span-2">
          <Textarea id="seo_keywords" rows={2} {...register("seo_keywords")} aria-invalid={!!errors.seo_keywords} />
        </Campo>
        <Campo id="about_text" rotulo="Texto “Sobre”" erro={errors.about_text?.message} className="sm:col-span-2">
          <Textarea id="about_text" rows={6} {...register("about_text")} aria-invalid={!!errors.about_text} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Redes e tracking">
        <Campo id="facebook_url" rotulo="Facebook" erro={errors.facebook_url?.message}>
          <Input id="facebook_url" type="url" placeholder="https://facebook.com/…" {...register("facebook_url")} aria-invalid={!!errors.facebook_url} />
        </Campo>
        <Campo id="instagram_url" rotulo="Instagram" erro={errors.instagram_url?.message}>
          <Input id="instagram_url" type="url" placeholder="https://instagram.com/…" {...register("instagram_url")} aria-invalid={!!errors.instagram_url} />
        </Campo>
        <Campo id="ga4_measurement_id" rotulo="Google Analytics 4 (Measurement ID)" erro={errors.ga4_measurement_id?.message} ajuda="Ex.: G-XXXXXXXXXX">
          <Input id="ga4_measurement_id" maxLength={30} {...register("ga4_measurement_id")} aria-invalid={!!errors.ga4_measurement_id} />
        </Campo>
        <Campo id="recaptcha_site_key" rotulo="reCAPTCHA (site key)" erro={errors.recaptcha_site_key?.message} ajuda="A chave secreta fica no servidor.">
          <Input id="recaptcha_site_key" maxLength={80} {...register("recaptcha_site_key")} aria-invalid={!!errors.recaptcha_site_key} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Aparência" descricao="Imagens e cores do tema. As imagens são enviadas após salvar os dados.">
        {IMAGENS_PORTAL.map((campo, i) => (
          <Controller
            key={campo}
            control={control}
            name={campo}
            render={({ field }) => (
              <CampoImagem
                id={campo}
                rotulo={ROTULO_IMAGEM[campo].rotulo}
                ajuda={ROTULO_IMAGEM[campo].ajuda}
                urlAtual={portal?.[`${campo}_url`]}
                arquivo={field.value}
                onArquivo={field.onChange}
                removido={removidos[i]}
                onRemover={(r) => setValue(`remover_${campo}`, r, { shouldDirty: true })}
                erro={errors[campo]?.message}
              />
            )}
          />
        ))}
        <CampoCor control={control} name="primary_color" rotulo="Cor primária" erro={errors.primary_color?.message} />
        <CampoCor control={control} name="secondary_color" rotulo="Cor secundária" erro={errors.secondary_color?.message} />
      </FormSecao>

      <FormSecao titulo="Configurações">
        <Campo id="realtors_page_slug" rotulo="Slug da página de imobiliárias" erro={errors.realtors_page_slug?.message} ajuda="Ex.: imobiliarias → /imobiliarias" obrigatorio>
          <Input id="realtors_page_slug" maxLength={80} {...register("realtors_page_slug")} aria-invalid={!!errors.realtors_page_slug} />
        </Campo>
        <Campo id="results_per_page" rotulo="Resultados por página" erro={errors.results_per_page?.message} obrigatorio>
          <Input id="results_per_page" type="number" min="1" {...register("results_per_page", { valueAsNumber: true })} aria-invalid={!!errors.results_per_page} />
        </Campo>
        <Campo id="thumbnail_max_width" rotulo="Largura máx. da miniatura (px)" erro={errors.thumbnail_max_width?.message} obrigatorio>
          <Input id="thumbnail_max_width" type="number" min="1" {...register("thumbnail_max_width", { valueAsNumber: true })} aria-invalid={!!errors.thumbnail_max_width} />
        </Campo>
        <Campo id="thumbnail_max_height" rotulo="Altura máx. da miniatura (px)" erro={errors.thumbnail_max_height?.message} obrigatorio>
          <Input id="thumbnail_max_height" type="number" min="1" {...register("thumbnail_max_height", { valueAsNumber: true })} aria-invalid={!!errors.thumbnail_max_height} />
        </Campo>
        <Campo id="watermark_position" rotulo="Posição da marca d'água" erro={errors.watermark_position?.message}>
          <Controller
            control={control}
            name="watermark_position"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger id="watermark_position" className="w-full" aria-invalid={!!errors.watermark_position}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {POSICOES_MARCA_DAGUA.map((p) => <SelectItem key={p.value} value={String(p.value)}>{p.value} – {p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>
      </FormSecao>

      <section className="rounded-xl border bg-card p-5">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">Menu principal</h2>
            <p className="text-sm text-muted-foreground">Itens exibidos na navegação do site, na ordem abaixo.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => menu.append({ label: "", path: "/", sort_order: menu.fields.length, is_active: true })}>
            <Plus data-icon="inline-start" /> Adicionar item
          </Button>
        </header>
        {menu.fields.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Nenhum item de menu. O site usará apenas os links padrão.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {menu.fields.map((item, i) => {
              const e = errors.menu_items?.[i];
              return (
                <li key={item.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-start">
                  <Campo id={`menu_items.${i}.label`} rotulo="Rótulo" erro={e?.label?.message}>
                    <Input id={`menu_items.${i}.label`} maxLength={60} placeholder="Ex.: Imóveis à venda" {...register(`menu_items.${i}.label`)} aria-invalid={!!e?.label} />
                  </Campo>
                  <Campo id={`menu_items.${i}.path`} rotulo="Caminho" erro={e?.path?.message}>
                    <Input id={`menu_items.${i}.path`} maxLength={200} placeholder="/venda" {...register(`menu_items.${i}.path`)} aria-invalid={!!e?.path} />
                  </Campo>
                  <Controller
                    control={control}
                    name={`menu_items.${i}.is_active`}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 pt-7 text-sm">
                        <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} /> Ativo
                      </label>
                    )}
                  />
                  <div className="flex items-center gap-1 pt-6">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Mover para cima" disabled={i === 0} onClick={() => menu.move(i, i - 1)}>
                      <ArrowUp />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Mover para baixo" disabled={i === menu.fields.length - 1} onClick={() => menu.move(i, i + 1)}>
                      <ArrowDown />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover item" className="text-destructive" onClick={() => menu.remove(i)}>
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {typeof errors.menu_items?.message === "string" && <p className="mt-2 text-xs text-destructive" role="alert">{errors.menu_items.message}</p>}
      </section>

      <FormFooter voltarHref="/portais" salvando={isSubmitting} />
    </form>
  );
}

/** Lista de checkboxes com busca local, para seleção múltipla de lookups. */
function ListaCheckbox({ id, rotulo, ajuda, opcoes, value, onChange, vazio, erro }: {
  id: string;
  rotulo: string;
  ajuda?: string;
  opcoes: LookupOption[];
  value: string[];
  onChange: (v: string[]) => void;
  vazio: string;
  erro?: string;
}) {
  const [busca, setBusca] = useState("");
  const selecionadas = useMemo(() => new Set(value), [value]);
  const filtradas = useMemo(() => {
    const q = busca.trim().toLocaleLowerCase("pt-BR");
    return q ? opcoes.filter((o) => o.value.toLocaleLowerCase("pt-BR").includes(q)) : opcoes;
  }, [opcoes, busca]);

  const alternar = (chave: string, marcar: boolean) => {
    if (marcar) onChange(selecionadas.has(chave) ? value : [...value, chave]);
    else onChange(value.filter((v) => v !== chave));
  };

  return (
    <Campo id={`${id}-busca`} rotulo={rotulo} ajuda={ajuda} erro={erro} className="sm:col-span-2">
      <div className="rounded-lg border">
        <div className="flex items-center justify-between gap-2 border-b p-2">
          <Input id={`${id}-busca`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Filtrar…" className="h-8 max-w-xs" disabled={opcoes.length === 0} />
          <span className="text-xs text-muted-foreground">{selecionadas.size} selecionada(s)</span>
          {selecionadas.size > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>Limpar</Button>
          )}
        </div>
        <div className="grid max-h-56 gap-1 overflow-y-auto p-2 sm:grid-cols-2 lg:grid-cols-3">
          {opcoes.length === 0 && <p className="col-span-full p-2 text-sm text-muted-foreground">{vazio}</p>}
          {opcoes.length > 0 && filtradas.length === 0 && <p className="col-span-full p-2 text-sm text-muted-foreground">Nenhum resultado para “{busca}”.</p>}
          {filtradas.map((o) => (
            <label key={o.key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
              <Checkbox checked={selecionadas.has(o.key)} onCheckedChange={(c) => alternar(o.key, c === true)} />
              <span className="truncate">{o.value}</span>
            </label>
          ))}
        </div>
      </div>
    </Campo>
  );
}

/** Seletor de cor + campo hexadecimal editável (vazio = usar padrão do tema). */
function CampoCor({ control, name, rotulo, erro }: { control: Control<Valores>; name: "primary_color" | "secondary_color"; rotulo: string; erro?: string }) {
  return (
    <Campo id={name} rotulo={rotulo} erro={erro} ajuda="Formato #RRGGBB. Deixe em branco para usar o padrão.">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={`Escolher ${rotulo.toLowerCase()}`}
              value={/^#[0-9a-f]{6}$/i.test(field.value) ? field.value : "#000000"}
              onChange={(e) => field.onChange(e.target.value)}
              className="size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent p-0.5"
            />
            <Input id={name} value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#RRGGBB" maxLength={9} className="font-mono" aria-invalid={!!erro} />
          </div>
        )}
      />
    </Campo>
  );
}

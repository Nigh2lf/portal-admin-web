"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { SelectLookup } from "@/components/form/select-lookup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { salvarRecurso, salvarRecursoMultipart } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";
import { formatarData } from "@/lib/utils/format";
import { datetimeLocalParaIso, isoParaDatetimeLocal, mascararDocumento } from "./mascaras";
import { anuncianteSchema, inteiroOuNulo, type AnuncianteForm as Valores } from "./schemas";
import { TIPOS_ANUNCIANTE, type AnuncianteDetalhe } from "./types";

interface Props {
  anunciante: AnuncianteDetalhe | null;
  cidades: LookupOption[];
}

type Limite = "property_limit" | "photo_limit" | "featured_limit" | "super_featured_limit";
const LIMITES: Array<{ nome: Limite; rotulo: string }> = [
  { nome: "property_limit", rotulo: "Limite de imóveis" },
  { nome: "photo_limit", rotulo: "Limite de fotos por imóvel" },
  { nome: "featured_limit", rotulo: "Limite de destaques" },
  { nome: "super_featured_limit", rotulo: "Limite de super destaques" },
];

type OpcaoPortal = "is_published" | "notify_by_email" | "has_hotsite" | "has_realtor_page" | "receives_property_requests";
const OPCOES_PORTAL: Array<{ nome: OpcaoPortal; rotulo: string; ajuda: string }> = [
  { nome: "is_published", rotulo: "Publicado", ajuda: "Aparece no portal e tem os imóveis exibidos." },
  { nome: "notify_by_email", rotulo: "Notificar por e-mail", ajuda: "Recebe mensagens de interessados por e-mail." },
  { nome: "has_hotsite", rotulo: "Possui hotsite", ajuda: "Página própria com a carteira de imóveis." },
  { nome: "has_realtor_page", rotulo: "Página de imobiliária", ajuda: "Listado na página de imobiliárias do portal." },
  { nome: "receives_property_requests", rotulo: "Recebe encomendas", ajuda: "Recebe pedidos de imóveis dos visitantes." },
];

const limiteTexto = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

export function AnuncianteForm({ anunciante, cidades }: Props) {
  const router = useRouter();
  const integ = anunciante?.integration ?? null;
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [integracaoAberta, setIntegracaoAberta] = useState(Boolean(integ));

  const form = useForm<Valores>({
    resolver: zodResolver(anuncianteSchema),
    defaultValues: {
      type: anunciante?.type ?? "AGENCY",
      name: anunciante?.name ?? "",
      slug: anunciante?.slug ?? "",
      document: anunciante ? mascararDocumento(anunciante.document, anunciante.type) : "",
      email: anunciante?.email ?? "",
      phone: anunciante?.phone ?? "",
      phone_secondary: anunciante?.phone_secondary ?? "",
      whatsapp: anunciante?.whatsapp ?? "",
      website: anunciante?.website ?? "",
      address: anunciante?.address ?? "",
      creci: anunciante?.creci ?? "",
      contact_name: anunciante?.contact_name ?? "",
      responsible_broker: anunciante?.responsible_broker ?? "",
      notes: anunciante?.notes ?? "",
      coupon: anunciante?.coupon ?? "",
      portal: anunciante?.portal ?? "",
      plan: anunciante?.plan ?? "",
      is_published: anunciante?.is_published ?? false,
      notify_by_email: anunciante?.notify_by_email ?? true,
      has_hotsite: anunciante?.has_hotsite ?? false,
      has_realtor_page: anunciante?.has_realtor_page ?? false,
      receives_property_requests: anunciante?.receives_property_requests ?? false,
      property_limit: limiteTexto(anunciante?.property_limit),
      photo_limit: limiteTexto(anunciante?.photo_limit),
      featured_limit: limiteTexto(anunciante?.featured_limit),
      super_featured_limit: limiteTexto(anunciante?.super_featured_limit),
      accepted_terms_at: isoParaDatetimeLocal(anunciante?.accepted_terms_at),
      cities: anunciante?.cities ?? [],
      tem_integracao: Boolean(integ),
      integration: {
        integrator: integ?.integrator ?? null,
        xml_url: integ?.xml_url ?? "",
        xml_default_url: integ?.xml_default_url ?? "",
        api_token: "",
        vista_portal_key: "",
        vista_customer_code: "",
        vista_customer_key: "",
        vista_api_url: "",
        save_all_images: integ?.save_all_images ?? false,
        skip_thumbnails: integ?.skip_thumbnails ?? false,
        is_active: integ?.is_active ?? true,
      },
      remover_logo: false,
    },
  });
  const { register, control, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = form;
  const tipo = useWatch({ control, name: "type" });
  const temIntegracao = useWatch({ control, name: "tem_integracao" });
  const removerLogo = useWatch({ control, name: "remover_logo" });

  const escolherLogo = (arquivo: File | null) => {
    setLogo(arquivo);
    setPreviewLogo((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return arquivo ? URL.createObjectURL(arquivo) : null;
    });
    if (arquivo) setValue("remover_logo", false);
  };

  const onSubmit = handleSubmit(async (v) => {
    const { tem_integracao, integration, remover_logo, document, accepted_terms_at, property_limit, photo_limit, featured_limit, super_featured_limit, ...resto } = v;
    const body: Record<string, unknown> = {
      ...resto,
      document: document.replace(/\D/g, ""),
      accepted_terms_at: datetimeLocalParaIso(accepted_terms_at),
      property_limit: inteiroOuNulo(property_limit),
      photo_limit: inteiroOuNulo(photo_limit),
      featured_limit: inteiroOuNulo(featured_limit),
      super_featured_limit: inteiroOuNulo(super_featured_limit),
    };
    if (tem_integracao) {
      // Segredos em branco não são enviados (mantém o valor cadastrado).
      const { api_token, vista_portal_key, vista_customer_code, vista_customer_key, vista_api_url, ...publicos } = integration;
      const segredos: Record<string, string> = { api_token, vista_portal_key, vista_customer_code, vista_customer_key, vista_api_url };
      body.integration = { ...publicos, ...Object.fromEntries(Object.entries(segredos).filter(([, s]) => s !== "")) };
    } else if (integ) {
      body.integration = null;
    }
    if (remover_logo && !logo) body.logo = null;

    const r = await salvarRecurso<AnuncianteDetalhe>("advertisers", anunciante?.id ?? null, body, ["/anunciantes"]);
    if (!r.ok) {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
      return;
    }
    const id = anunciante?.id ?? r.data?.id;
    if (logo && id) {
      const fd = new FormData();
      fd.append("logo", logo);
      const rl = await salvarRecursoMultipart("advertisers", id, fd, ["/anunciantes"]);
      if (!rl.ok) {
        toast.warning(`Dados salvos, mas o logo não foi enviado: ${mensagemErro(rl)}`);
        router.push(`/anunciantes/${id}`);
        router.refresh();
        return;
      }
    }
    toast.success(r.message);
    router.push("/anunciantes");
    router.refresh();
  });

  const logoAtual = previewLogo ?? (removerLogo ? null : (anunciante?.logo_url ?? null));

  return (
    <form onSubmit={onSubmit} className="flex max-w-4xl flex-col gap-6">
      <FormSecao titulo="Identificação" descricao="Quem é o anunciante e como entrar em contato.">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
              {TIPOS_ANUNCIANTE.map((t) => (
                <label key={t.value} htmlFor={`type-${t.value}`} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                  <RadioGroupItem id={`type-${t.value}`} value={t.value} className="mt-0.5" />
                  <span>
                    <span className="block font-medium">{t.label}</span>
                    <span className="block text-sm text-muted-foreground">{t.descricao}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}
        />
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="slug" rotulo="Slug" erro={errors.slug?.message} ajuda="Deixe em branco para gerar a partir do nome.">
          <Input id="slug" {...register("slug")} aria-invalid={!!errors.slug} placeholder="gerado automaticamente" />
        </Campo>
        <Campo id="document" rotulo={tipo === "AGENCY" ? "CNPJ" : "CPF"} erro={errors.document?.message}>
          <Controller
            control={control}
            name="document"
            render={({ field }) => (
              <Input
                id="document"
                inputMode="numeric"
                value={mascararDocumento(field.value, tipo)}
                onChange={(e) => field.onChange(mascararDocumento(e.target.value, tipo))}
                aria-invalid={!!errors.document}
                placeholder={tipo === "AGENCY" ? "00.000.000/0000-00" : "000.000.000-00"}
              />
            )}
          />
        </Campo>
        <Campo id="email" rotulo="E-mail" erro={errors.email?.message} obrigatorio>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        </Campo>
        <Campo id="phone" rotulo="Telefone" erro={errors.phone?.message}>
          <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
        </Campo>
        <Campo id="phone_secondary" rotulo="Telefone secundário" erro={errors.phone_secondary?.message}>
          <Input id="phone_secondary" {...register("phone_secondary")} aria-invalid={!!errors.phone_secondary} />
        </Campo>
        <Campo id="whatsapp" rotulo="WhatsApp" erro={errors.whatsapp?.message}>
          <Input id="whatsapp" {...register("whatsapp")} aria-invalid={!!errors.whatsapp} />
        </Campo>
        <Campo id="website" rotulo="Site" erro={errors.website?.message}>
          <Input id="website" type="url" placeholder="https://" {...register("website")} aria-invalid={!!errors.website} />
        </Campo>
        <Campo id="address" rotulo="Endereço" erro={errors.address?.message} className="sm:col-span-2">
          <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
        </Campo>
        <Campo id="creci" rotulo="CRECI" erro={errors.creci?.message}>
          <Input id="creci" {...register("creci")} aria-invalid={!!errors.creci} />
        </Campo>
        <Campo id="contact_name" rotulo="Nome do contato" erro={errors.contact_name?.message}>
          <Input id="contact_name" {...register("contact_name")} aria-invalid={!!errors.contact_name} />
        </Campo>
        <Campo id="responsible_broker" rotulo="Corretor responsável" erro={errors.responsible_broker?.message}>
          <Input id="responsible_broker" {...register("responsible_broker")} aria-invalid={!!errors.responsible_broker} />
        </Campo>
        <Campo id="coupon" rotulo="Cupom" erro={errors.coupon?.message}>
          <Input id="coupon" {...register("coupon")} aria-invalid={!!errors.coupon} />
        </Campo>
        <Campo id="notes" rotulo="Observações" erro={errors.notes?.message} className="sm:col-span-2">
          <Textarea id="notes" rows={3} {...register("notes")} aria-invalid={!!errors.notes} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Portal e plano" descricao="Onde o anunciante aparece e o que pode publicar.">
        <Campo id="portal" rotulo="Portal" erro={errors.portal?.message} obrigatorio>
          <Controller
            control={control}
            name="portal"
            render={({ field }) => <SelectLookup id="portal" recurso="portals" value={field.value} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o portal…" />}
          />
        </Campo>
        <Campo id="plan" rotulo="Plano" erro={errors.plan?.message} obrigatorio>
          <Controller
            control={control}
            name="plan"
            render={({ field }) => <SelectLookup id="plan" recurso="plans" value={field.value} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o plano…" />}
          />
        </Campo>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
          {OPCOES_PORTAL.map((o) => (
            <Controller
              key={o.nome}
              control={control}
              name={o.nome}
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm">
                  <Switch id={o.nome} checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                  <span>
                    <span className="block font-medium">{o.rotulo}</span>
                    <span className="block text-muted-foreground">{o.ajuda}</span>
                  </span>
                </label>
              )}
            />
          ))}
        </div>
        {LIMITES.map((l) => (
          <Campo key={l.nome} id={l.nome} rotulo={l.rotulo} erro={errors[l.nome]?.message} ajuda="Em branco = usar o limite do plano.">
            <Input id={l.nome} type="number" min={0} step={1} placeholder="usar do plano" {...register(l.nome)} aria-invalid={!!errors[l.nome]} />
          </Campo>
        ))}
        <Campo id="accepted_terms_at" rotulo="Aceite dos termos" erro={errors.accepted_terms_at?.message}>
          <Input id="accepted_terms_at" type="datetime-local" {...register("accepted_terms_at")} aria-invalid={!!errors.accepted_terms_at} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Cidades de atuação" descricao="Cidades em que o anunciante trabalha.">
        <Controller
          control={control}
          name="cities"
          render={({ field }) => (
            <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
              {cidades.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cidade cadastrada.</p>}
              {cidades.map((c) => {
                const marcado = field.value.includes(c.key);
                return (
                  <label key={c.key} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary">
                    <Checkbox checked={marcado} onCheckedChange={(ch) => field.onChange(ch ? [...field.value, c.key] : field.value.filter((x) => x !== c.key))} />
                    {c.value}
                  </label>
                );
              })}
            </div>
          )}
        />
      </FormSecao>

      <section className="rounded-xl border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-semibold">Integração</h2>
            <p className="text-sm text-muted-foreground">Importação de imóveis por XML ou API (Vista).</p>
          </div>
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="tem_integracao"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    id="tem_integracao"
                    checked={field.value}
                    onCheckedChange={(c) => {
                      field.onChange(c);
                      setIntegracaoAberta(c);
                    }}
                  />
                  {field.value ? "Com integração" : "Sem integração"}
                </label>
              )}
            />
            {temIntegracao && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setIntegracaoAberta((a) => !a)} aria-expanded={integracaoAberta} aria-controls="integracao-campos">
                {integracaoAberta ? <ChevronUp data-icon="inline-start" /> : <ChevronDown data-icon="inline-start" />}
                {integracaoAberta ? "Recolher" : "Expandir"}
              </Button>
            )}
          </div>
        </header>
        {temIntegracao && integracaoAberta && (
          <div id="integracao-campos" className="grid gap-4 border-t p-5 sm:grid-cols-2">
            <Campo id="integration.integrator" rotulo="Integrador" erro={errors.integration?.integrator?.message}>
              <Controller
                control={control}
                name="integration.integrator"
                render={({ field }) => <SelectLookup id="integration.integrator" recurso="integrators" value={field.value} onChange={field.onChange} placeholder="Sem integrador" />}
              />
            </Campo>
            <Campo id="integration.is_active" rotulo="Status da integração">
              <Controller
                control={control}
                name="integration.is_active"
                render={({ field }) => (
                  <label className="flex h-9 items-center gap-3 text-sm">
                    <Switch id="integration.is_active" checked={field.value} onCheckedChange={field.onChange} />
                    {field.value ? "Ativa: importa automaticamente" : "Inativa: importação pausada"}
                  </label>
                )}
              />
            </Campo>
            <Campo id="integration.xml_url" rotulo="URL do XML" erro={errors.integration?.xml_url?.message}>
              <Input id="integration.xml_url" type="url" placeholder="https://" {...register("integration.xml_url")} aria-invalid={!!errors.integration?.xml_url} />
            </Campo>
            <Campo id="integration.xml_default_url" rotulo="URL padrão do XML" erro={errors.integration?.xml_default_url?.message}>
              <Input id="integration.xml_default_url" type="url" placeholder="https://" {...register("integration.xml_default_url")} aria-invalid={!!errors.integration?.xml_default_url} />
            </Campo>
            <Campo
              id="integration.api_token"
              rotulo="Token da API"
              erro={errors.integration?.api_token?.message}
              ajuda={integ?.has_api_token ? "Token cadastrado. Deixe em branco para manter." : "Em branco = sem token."}
            >
              <div className="flex items-center gap-2">
                <Input id="integration.api_token" type="password" autoComplete="off" {...register("integration.api_token")} aria-invalid={!!errors.integration?.api_token} />
                {integ?.has_api_token && <Badge variant="secondary" className="shrink-0">token cadastrado</Badge>}
              </div>
            </Campo>
            <Campo
              id="integration.vista_api_url"
              rotulo="Vista: URL da API"
              erro={errors.integration?.vista_api_url?.message}
              ajuda={integ?.has_vista_credentials ? "Credenciais Vista cadastradas. Em branco mantém." : undefined}
            >
              <Input id="integration.vista_api_url" type="url" placeholder="https://" {...register("integration.vista_api_url")} aria-invalid={!!errors.integration?.vista_api_url} />
            </Campo>
            <Campo id="integration.vista_portal_key" rotulo="Vista: chave do portal" erro={errors.integration?.vista_portal_key?.message}>
              <Input id="integration.vista_portal_key" type="password" autoComplete="off" {...register("integration.vista_portal_key")} aria-invalid={!!errors.integration?.vista_portal_key} />
            </Campo>
            <Campo id="integration.vista_customer_code" rotulo="Vista: código do cliente" erro={errors.integration?.vista_customer_code?.message}>
              <Input id="integration.vista_customer_code" type="password" autoComplete="off" {...register("integration.vista_customer_code")} aria-invalid={!!errors.integration?.vista_customer_code} />
            </Campo>
            <Campo id="integration.vista_customer_key" rotulo="Vista: chave do cliente" erro={errors.integration?.vista_customer_key?.message}>
              <Input id="integration.vista_customer_key" type="password" autoComplete="off" {...register("integration.vista_customer_key")} aria-invalid={!!errors.integration?.vista_customer_key} />
            </Campo>
            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
              <Controller
                control={control}
                name="integration.save_all_images"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    Salvar todas as imagens do XML
                  </label>
                )}
              />
              <Controller
                control={control}
                name="integration.skip_thumbnails"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    Não gerar miniaturas
                  </label>
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Última importação: <span className="font-medium text-foreground">{integ?.last_imported_at ? formatarData(integ.last_imported_at, true) : "nunca"}</span>
            </p>
          </div>
        )}
      </section>

      <FormSecao titulo="Logo" descricao="Imagem exibida no portal e no hotsite.">
        <div className="flex items-start gap-4 sm:col-span-2">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {logoAtual ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL da API ou preview local; sem otimização do Next.
              <img src={logoAtual} alt="Logo do anunciante" className="size-full object-contain" />
            ) : (
              <ImageOff className="size-6 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Campo id="logo" rotulo="Arquivo" ajuda="PNG, JPG ou WEBP. Enviado após salvar os dados.">
              <Input id="logo" type="file" accept="image/*" onChange={(e) => escolherLogo(e.target.files?.[0] ?? null)} />
            </Campo>
            {anunciante?.logo_url && !logo && (
              <Controller
                control={control}
                name="remover_logo"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    Remover logo atual
                  </label>
                )}
              />
            )}
          </div>
        </div>
      </FormSecao>

      <FormFooter voltarHref="/anunciantes" salvando={isSubmitting} />
    </form>
  );
}

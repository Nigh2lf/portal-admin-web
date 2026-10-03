"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Images, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { SelectLookup } from "@/components/form/select-lookup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { salvarRecurso } from "@/lib/actions/crud";
import type { LookupOption } from "@/lib/api/types";
import { areaParaDecimal, brlParaDecimal, decimalParaArea, decimalParaBRL, mascararBRL } from "./moeda";
import { imovelSchema, type ImovelForm as Valores } from "./schemas";
import { PERIODOS_TAXA, STATUS_IMOVEL, type ImovelDetalhe } from "./types";

interface Props {
  imovel: ImovelDetalhe | null;
  caracteristicasImovel: LookupOption[];
  caracteristicasCondominio: LookupOption[];
}

type CampoInteiro = "bedrooms" | "suites" | "bathrooms" | "parking_spaces";
const INTEIROS: Array<{ nome: CampoInteiro; rotulo: string }> = [
  { nome: "bedrooms", rotulo: "Quartos" },
  { nome: "suites", rotulo: "Suítes" },
  { nome: "bathrooms", rotulo: "Banheiros" },
  { nome: "parking_spaces", rotulo: "Vagas" },
];

type CampoPreco = "sale_price" | "rent_price" | "seasonal_rent_price";
const PRECOS: Array<{ nome: CampoPreco; rotulo: string }> = [
  { nome: "sale_price", rotulo: "Venda" },
  { nome: "rent_price", rotulo: "Aluguel (mensal)" },
  { nome: "seasonal_rent_price", rotulo: "Temporada" },
];

const DESCRICAO_MAX = 5000;

export function ImovelForm({ imovel, caracteristicasImovel, caracteristicasCondominio }: Props) {
  const router = useRouter();
  const form = useForm<Valores>({
    resolver: zodResolver(imovelSchema),
    defaultValues: {
      advertiser: imovel?.advertiser ?? "",
      reference_code: imovel?.reference_code ?? "",
      status: imovel?.status ?? "PUBLISHED",
      is_active: imovel?.is_active ?? true,
      is_featured: imovel?.is_featured ?? false,
      property_type: imovel?.property_type ?? "",
      city: imovel?.city ?? "",
      neighborhood: imovel?.neighborhood ?? null,
      custom_neighborhood_name: imovel?.custom_neighborhood_name ?? "",
      is_in_condominium: imovel?.is_in_condominium ?? false,
      bedrooms: String(imovel?.bedrooms ?? 0),
      suites: String(imovel?.suites ?? 0),
      bathrooms: String(imovel?.bathrooms ?? 0),
      parking_spaces: String(imovel?.parking_spaces ?? 0),
      built_area: decimalParaArea(imovel?.built_area),
      total_area: decimalParaArea(imovel?.total_area),
      sale_price: decimalParaBRL(imovel?.sale_price),
      rent_price: decimalParaBRL(imovel?.rent_price),
      seasonal_rent_price: decimalParaBRL(imovel?.seasonal_rent_price),
      fees: (imovel?.fees ?? []).map((f) => ({ description: f.description, amount: decimalParaBRL(f.amount), period: f.period, notes: f.notes ?? "" })),
      description: imovel?.description ?? "",
      features: imovel?.features ?? [],
      regenerar_titulo: false,
    },
  });
  const { register, control, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = form;
  const { fields: taxas, append, remove } = useFieldArray({ control, name: "fees" });
  const cidade = useWatch({ control, name: "city" });
  const emCondominio = useWatch({ control, name: "is_in_condominium" });
  const descricao = useWatch({ control, name: "description" });

  const onSubmit = handleSubmit(async (v) => {
    const idsCondominio = new Set(caracteristicasCondominio.map((c) => c.key));
    const body: Record<string, unknown> = {
      advertiser: v.advertiser,
      reference_code: v.reference_code,
      status: v.status,
      is_active: v.is_active,
      is_featured: v.is_featured,
      property_type: v.property_type,
      city: v.city,
      neighborhood: v.neighborhood || null,
      custom_neighborhood_name: v.neighborhood ? "" : v.custom_neighborhood_name,
      is_in_condominium: v.is_in_condominium,
      bedrooms: Number(v.bedrooms || 0),
      suites: Number(v.suites || 0),
      bathrooms: Number(v.bathrooms || 0),
      parking_spaces: Number(v.parking_spaces || 0),
      built_area: areaParaDecimal(v.built_area),
      total_area: areaParaDecimal(v.total_area),
      description: v.description,
      sale_price: brlParaDecimal(v.sale_price),
      rent_price: brlParaDecimal(v.rent_price),
      seasonal_rent_price: brlParaDecimal(v.seasonal_rent_price),
      fees: v.fees.map((f) => ({ description: f.description, amount: brlParaDecimal(f.amount), period: f.period, notes: f.notes })),
      features: v.is_in_condominium ? v.features : v.features.filter((id) => !idsCondominio.has(id)),
    };
    if (imovel && v.regenerar_titulo) {
      body.title = "";
      body.slug = "";
    }
    const r = await salvarRecurso<ImovelDetalhe>("properties", imovel?.id ?? null, body, ["/imoveis"]);
    if (r.ok) {
      toast.success(r.message);
      router.push("/imoveis");
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  const gradeCaracteristicas = (opcoes: LookupOption[], desabilitado = false) => (
    <Controller
      control={control}
      name="features"
      render={({ field }) => (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {opcoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma característica cadastrada.</p>}
          {opcoes.map((c) => {
            const marcado = field.value.includes(c.key);
            return (
              <label key={c.key} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-disabled:cursor-not-allowed has-disabled:opacity-50">
                <Checkbox
                  checked={marcado}
                  disabled={desabilitado}
                  onCheckedChange={(ch) => field.onChange(ch ? [...field.value, c.key] : field.value.filter((x) => x !== c.key))}
                />
                {c.value}
              </label>
            );
          })}
        </div>
      )}
    />
  );

  return (
    <form onSubmit={onSubmit} className="flex max-w-4xl flex-col gap-6">
      <FormSecao titulo="Identificação" descricao={imovel ? "Título e slug são gerados pelo sistema a partir do tipo, objetivo e localização." : "Título e slug serão gerados automaticamente ao salvar."}>
        <Campo id="advertiser" rotulo="Anunciante" erro={errors.advertiser?.message} obrigatorio>
          <Controller
            control={control}
            name="advertiser"
            render={({ field }) => <SelectLookup id="advertiser" recurso="advertisers" value={field.value} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o anunciante…" />}
          />
        </Campo>
        <Campo id="reference_code" rotulo="Código de referência" erro={errors.reference_code?.message} obrigatorio ajuda="Único por anunciante.">
          <Input id="reference_code" {...register("reference_code")} aria-invalid={!!errors.reference_code} />
        </Campo>
        {imovel && (
          <>
            <Campo id="title" rotulo="Título (gerado)">
              <Input id="title" value={imovel.title} readOnly disabled />
            </Campo>
            <Campo id="slug" rotulo="Slug (gerado)">
              <Input id="slug" value={imovel.slug} readOnly disabled className="font-mono text-xs" />
            </Campo>
            <Controller
              control={control}
              name="regenerar_titulo"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm sm:col-span-2">
                  <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                  <span>
                    Regenerar título e slug ao salvar
                    <span className="block text-xs text-muted-foreground">Use após mudar tipo, bairro, cidade ou os valores. O endereço público do imóvel muda.</span>
                  </span>
                </label>
              )}
            />
          </>
        )}
        <Campo id="status" rotulo="Status" erro={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_IMOVEL.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                {field.value ? "Ativo" : "Inativo"}
              </label>
            )}
          />
          <Controller
            control={control}
            name="is_featured"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
                <Switch id="is_featured" checked={field.value} onCheckedChange={field.onChange} />
                Destaque
              </label>
            )}
          />
        </div>
      </FormSecao>

      <FormSecao titulo="Localização">
        <Campo id="property_type" rotulo="Tipo de imóvel" erro={errors.property_type?.message} obrigatorio>
          <Controller
            control={control}
            name="property_type"
            render={({ field }) => <SelectLookup id="property_type" recurso="property-types" value={field.value} onChange={(v) => field.onChange(v ?? "")} permitirVazio={false} placeholder="Selecione o tipo…" />}
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
                value={field.value}
                onChange={(v) => {
                  field.onChange(v ?? "");
                  setValue("neighborhood", null, { shouldDirty: true });
                }}
                permitirVazio={false}
                placeholder="Selecione a cidade…"
              />
            )}
          />
        </Campo>
        <Campo id="neighborhood" rotulo="Bairro" erro={errors.neighborhood?.message} ajuda={cidade ? undefined : "Selecione a cidade primeiro."}>
          <Controller
            control={control}
            name="neighborhood"
            render={({ field }) => <SelectLookup id="neighborhood" recurso="neighborhoods" params={{ city: cidade || undefined }} value={field.value} onChange={field.onChange} disabled={!cidade} placeholder="Selecione o bairro…" />}
          />
        </Campo>
        <Campo id="custom_neighborhood_name" rotulo="Outro bairro" erro={errors.custom_neighborhood_name?.message} ajuda="Use quando o bairro não existe no cadastro. Ignorado se um bairro foi selecionado.">
          <Input id="custom_neighborhood_name" {...register("custom_neighborhood_name")} aria-invalid={!!errors.custom_neighborhood_name} />
        </Campo>
        <Controller
          control={control}
          name="is_in_condominium"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm sm:col-span-2">
              <Switch id="is_in_condominium" checked={field.value} onCheckedChange={field.onChange} />
              Fica em condomínio
            </label>
          )}
        />
      </FormSecao>

      <FormSecao titulo="Características">
        <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-4">
          {INTEIROS.map((c) => (
            <Campo key={c.nome} id={c.nome} rotulo={c.rotulo} erro={errors[c.nome]?.message}>
              <Input id={c.nome} type="number" min={0} step={1} {...register(c.nome)} aria-invalid={!!errors[c.nome]} />
            </Campo>
          ))}
        </div>
        <Campo id="built_area" rotulo="Área construída (m²)" erro={errors.built_area?.message}>
          <Input id="built_area" inputMode="decimal" placeholder="ex.: 120,50" {...register("built_area")} aria-invalid={!!errors.built_area} />
        </Campo>
        <Campo id="total_area" rotulo="Área total (m²)" erro={errors.total_area?.message}>
          <Input id="total_area" inputMode="decimal" placeholder="ex.: 360" {...register("total_area")} aria-invalid={!!errors.total_area} />
        </Campo>
      </FormSecao>

      <FormSecao titulo="Valores" descricao="Informe ao menos um valor. O objetivo do anúncio (venda, aluguel ou temporada) é derivado dos valores preenchidos.">
        {PRECOS.map((p) => (
          <Campo key={p.nome} id={p.nome} rotulo={p.rotulo} erro={errors[p.nome]?.message}>
            <Controller
              control={control}
              name={p.nome}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <Input id={p.nome} inputMode="numeric" placeholder="0,00" value={field.value} onChange={(e) => field.onChange(mascararBRL(e.target.value))} aria-invalid={!!errors[p.nome]} />
                </div>
              )}
            />
          </Campo>
        ))}
      </FormSecao>

      <section className="rounded-xl border bg-card p-5">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Taxas</h2>
            <p className="text-sm text-muted-foreground">IPTU, condomínio e outras cobranças recorrentes ou únicas.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", amount: "", period: "MONTHLY", notes: "" })}>
            <Plus data-icon="inline-start" /> Adicionar taxa
          </Button>
        </header>
        {taxas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma taxa cadastrada.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {taxas.map((t, i) => (
              <div key={t.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_10rem_9rem_1fr_auto] sm:items-start">
                <Campo id={`fees.${i}.description`} rotulo="Descrição" erro={errors.fees?.[i]?.description?.message} obrigatorio>
                  <Input id={`fees.${i}.description`} placeholder="ex.: IPTU" {...register(`fees.${i}.description`)} aria-invalid={!!errors.fees?.[i]?.description} />
                </Campo>
                <Campo id={`fees.${i}.amount`} rotulo="Valor (R$)" erro={errors.fees?.[i]?.amount?.message} obrigatorio>
                  <Controller
                    control={control}
                    name={`fees.${i}.amount`}
                    render={({ field }) => <Input id={`fees.${i}.amount`} inputMode="numeric" placeholder="0,00" value={field.value} onChange={(e) => field.onChange(mascararBRL(e.target.value))} aria-invalid={!!errors.fees?.[i]?.amount} />}
                  />
                </Campo>
                <Campo id={`fees.${i}.period`} rotulo="Período">
                  <Controller
                    control={control}
                    name={`fees.${i}.period`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={`fees.${i}.period`} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PERIODOS_TAXA.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Campo>
                <Campo id={`fees.${i}.notes`} rotulo="Observações" erro={errors.fees?.[i]?.notes?.message}>
                  <Input id={`fees.${i}.notes`} {...register(`fees.${i}.notes`)} aria-invalid={!!errors.fees?.[i]?.notes} />
                </Campo>
                <Button type="button" variant="ghost" size="icon-sm" className="sm:mt-6" onClick={() => remove(i)} aria-label={`Remover taxa ${i + 1}`}>
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5">
        <header className="mb-4">
          <h2 className="font-semibold">Descrição</h2>
          <p className="text-sm text-muted-foreground">Texto exibido na página do imóvel.</p>
        </header>
        <Campo id="description" rotulo="Descrição" erro={errors.description?.message}>
          <Textarea id="description" rows={8} maxLength={DESCRICAO_MAX} {...register("description")} aria-invalid={!!errors.description} />
          <p className="text-right text-xs text-muted-foreground" aria-live="polite">
            {(descricao ?? "").length.toLocaleString("pt-BR")} / {DESCRICAO_MAX.toLocaleString("pt-BR")}
          </p>
        </Campo>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <header className="mb-4">
          <h2 className="font-semibold">Infraestrutura</h2>
          <p className="text-sm text-muted-foreground">Características do imóvel e do condomínio.</p>
        </header>
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="mb-2 text-sm font-medium">Imóvel</h3>
            {gradeCaracteristicas(caracteristicasImovel)}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">
              Condomínio
              {!emCondominio && <span className="ml-2 text-xs font-normal text-muted-foreground">(marque &quot;Fica em condomínio&quot; para habilitar)</span>}
            </h3>
            {gradeCaracteristicas(caracteristicasCondominio, !emCondominio)}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <div>
          {imovel && (
            <Button asChild variant="outline" type="button">
              <Link href={`/imoveis/${imovel.id}/fotos`}><Images data-icon="inline-start" /> Fotos ({imovel.photos.length})</Link>
            </Button>
          )}
        </div>
        <div className="flex-1">
          <FormFooter voltarHref="/imoveis" salvando={isSubmitting} />
        </div>
      </div>
    </form>
  );
}

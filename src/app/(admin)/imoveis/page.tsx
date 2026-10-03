import Link from "next/link";
import { ImageOff, Images, Plus, Star } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { STATUS_IMOVEL, type ImovelLista } from "@/features/imoveis/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData, formatarMoeda } from "@/lib/utils/format";

export const metadata = { title: "Imóveis" };

const FILTROS = ["advertiser", "property_type", "city", "status", "is_active", "ad_type"];

function Precos({ i }: { i: ImovelLista }) {
  const itens = [
    { rotulo: "Venda", valor: i.sale_price },
    { rotulo: "Aluguel", valor: i.rent_price },
    { rotulo: "Temporada", valor: i.seasonal_rent_price },
  ].filter((p) => p.valor !== null && p.valor !== "");
  if (!itens.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      {itens.map((p) => (
        <span key={p.rotulo}>
          <span className="text-xs text-muted-foreground">{p.rotulo}: </span>
          <span className="font-medium tabular-nums">{formatarMoeda(p.valor)}</span>
        </span>
      ))}
    </div>
  );
}

export default async function ImoveisPage({ searchParams }: PageProps<"/imoveis">) {
  const sessao = await requirePermissao("property");
  const params = paramsDeBusca(await searchParams, FILTROS, { ordering: "-updated_at" });
  const [pagina, anunciantes, tipos, cidades] = await Promise.all([
    recurso.listar<ImovelLista>("properties", params),
    recurso.lookup("advertisers").catch(() => [] as LookupOption[]),
    recurso.lookup("property-types").catch(() => [] as LookupOption[]),
    recurso.lookup("cities").catch(() => [] as LookupOption[]),
  ]);
  const opcoes = (l: LookupOption[]) => l.map((o) => ({ value: o.key, label: o.value }));
  const podeEditar = pode(sessao, "property", "update");

  return (
    <>
      <PageHeader
        titulo="Imóveis"
        descricao="Anúncios publicados pelos anunciantes nos portais."
        crumbs={[{ label: "Imóveis" }]}
        acoes={
          pode(sessao, "property", "create") && (
            <Button asChild>
              <Link href="/imoveis/novo"><Plus data-icon="inline-start" /> Novo imóvel</Link>
            </Button>
          )
        }
      />
      <Toolbar
        placeholder="Buscar por referência, título ou descrição…"
        filtros={[
          { nome: "advertiser", rotulo: "Anunciante", opcoes: opcoes(anunciantes) },
          { nome: "property_type", rotulo: "Tipo", opcoes: opcoes(tipos) },
          { nome: "city", rotulo: "Cidade", opcoes: opcoes(cidades) },
          { nome: "status", rotulo: "Status", opcoes: STATUS_IMOVEL.map((s) => ({ value: s.value, label: s.label })) },
          { nome: "is_active", rotulo: "Ativo", opcoes: [{ value: "true", label: "Ativos" }, { value: "false", label: "Inativos" }] },
          { nome: "ad_type", rotulo: "Tipo do anúncio", opcoes: [{ value: "NORMAL", label: "Normal" }, { value: "FEATURED", label: "Destaque" }, { value: "SUPER_FEATURED", label: "Superdestaque" }] },
        ]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          {
            chave: "cover_photo_url",
            titulo: "",
            className: "w-16",
            render: (i) => (
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
                {i.cover_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL servida pela API; sem otimização do Next.
                  <img src={i.cover_photo_url} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <ImageOff className="size-4 text-muted-foreground" aria-hidden />
                )}
              </div>
            ),
          },
          { chave: "reference_code", titulo: "Ref.", ordenavel: "reference_code", render: (i) => <span className="font-mono text-xs">{i.reference_code}</span> },
          {
            chave: "title",
            titulo: "Título",
            ordenavel: "title",
            render: (i) => (
              <div className="max-w-xs">
                <Link href={`/imoveis/${i.id}`} className="font-medium hover:underline">{i.title || "(sem título)"}</Link>
                <p className="truncate text-xs text-muted-foreground">{i.advertiser_name}</p>
              </div>
            ),
          },
          { chave: "property_type_name", titulo: "Tipo" },
          {
            chave: "city_name",
            titulo: "Localização",
            render: (i) => (
              <span>
                {i.city_name}
                {i.neighborhood_name && <span className="block text-xs text-muted-foreground">{i.neighborhood_name}</span>}
              </span>
            ),
          },
          { chave: "precos", titulo: "Valores", ordenavel: "sale_price", render: (i) => <Precos i={i} /> },
          {
            chave: "status",
            titulo: "Status",
            ordenavel: "status",
            render: (i) => (
              <div className="flex flex-wrap gap-1">
                <Badge variant={i.status === "PUBLISHED" ? "default" : "secondary"}>{i.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</Badge>
                <StatusBadge ativo={i.is_active} />
                {i.ad_type === "SUPER_FEATURED" && <Badge className="gap-1"><Star className="size-3" /> Superdestaque</Badge>}
                {i.ad_type === "FEATURED" && <Badge variant="outline" className="gap-1 border-warning/40 text-warning"><Star className="size-3" /> Destaque</Badge>}
              </div>
            ),
          },
          { chave: "updated_at", titulo: "Atualizado", ordenavel: "updated_at", render: (i) => formatarData(i.updated_at, true) },
        ]}
        acoes={(i) => (
          <RowActions
            id={i.id}
            editarHref={`/imoveis/${i.id}`}
            recurso="properties"
            rotulo={`o imóvel ${i.reference_code}`}
            revalidar={["/imoveis"]}
            podeEditar={podeEditar}
            podeExcluir={pode(sessao, "property", "delete")}
            extras={
              podeEditar && (
                <DropdownMenuItem asChild>
                  <Link href={`/imoveis/${i.id}/fotos`}><Images /> Fotos</Link>
                </DropdownMenuItem>
              )
            }
          />
        )}
        vazio={{ titulo: "Nenhum imóvel encontrado", descricao: "Cadastre o primeiro imóvel ou ajuste os filtros." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

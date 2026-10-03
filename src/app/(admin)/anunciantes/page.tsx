import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROTULO_TIPO, TIPOS_ANUNCIANTE, type AnuncianteLista } from "@/features/anunciantes/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import type { LookupOption } from "@/lib/api/types";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Anunciantes" };

const FILTROS = ["portal", "plan", "type", "is_published"];

export default async function AnunciantesPage({ searchParams }: PageProps<"/anunciantes">) {
  const sessao = await requirePermissao("advertiser");
  const params = paramsDeBusca(await searchParams, FILTROS, { ordering: "name" });
  const [pagina, portais, planos] = await Promise.all([
    recurso.listar<AnuncianteLista>("advertisers", params),
    recurso.lookup("portals").catch(() => [] as LookupOption[]),
    recurso.lookup("plans").catch(() => [] as LookupOption[]),
  ]);

  return (
    <>
      <PageHeader
        titulo="Anunciantes"
        descricao="Proprietários, corretores e imobiliárias que publicam imóveis nos portais."
        crumbs={[{ label: "Anunciantes" }]}
        acoes={
          pode(sessao, "advertiser", "create") && (
            <Button asChild>
              <Link href="/anunciantes/novo"><Plus data-icon="inline-start" /> Novo anunciante</Link>
            </Button>
          )
        }
      />
      <Toolbar
        placeholder="Buscar por nome, e-mail, documento…"
        filtros={[
          { nome: "portal", rotulo: "Portal", opcoes: portais.map((p) => ({ value: p.key, label: p.value })) },
          { nome: "plan", rotulo: "Plano", opcoes: planos.map((p) => ({ value: p.key, label: p.value })) },
          { nome: "type", rotulo: "Tipo", opcoes: TIPOS_ANUNCIANTE.map((t) => ({ value: t.value, label: t.label })) },
          { nome: "is_published", rotulo: "Publicação", opcoes: [{ value: "true", label: "Publicado" }, { value: "false", label: "Não publicado" }] },
        ]}
      />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (a) => <Link href={`/anunciantes/${a.id}`} className="font-medium hover:underline">{a.name}</Link> },
          { chave: "type", titulo: "Tipo", ordenavel: "type", render: (a) => <Badge variant={a.type === "AGENCY" ? "default" : "secondary"}>{ROTULO_TIPO[a.type] ?? a.type}</Badge> },
          { chave: "email", titulo: "E-mail", ordenavel: "email" },
          { chave: "plan_name", titulo: "Plano" },
          { chave: "portal_name", titulo: "Portal" },
          { chave: "is_published", titulo: "Publicação", ordenavel: "is_published", render: (a) => <StatusBadge ativo={a.is_published} rotulos={["Publicado", "Não publicado"]} /> },
          { chave: "properties_count", titulo: "Imóveis", className: "text-right", render: (a) => (a.properties_count ?? "—") },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (a) => formatarData(a.created_at) },
        ]}
        acoes={(a) => (
          <RowActions
            id={a.id}
            editarHref={`/anunciantes/${a.id}`}
            recurso="advertisers"
            rotulo={`o anunciante ${a.name}`}
            revalidar={["/anunciantes"]}
            podeEditar={pode(sessao, "advertiser", "update")}
            podeExcluir={pode(sessao, "advertiser", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum anunciante encontrado", descricao: "Cadastre o primeiro anunciante ou ajuste os filtros." }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

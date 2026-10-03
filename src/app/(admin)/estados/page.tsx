import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { PaginationBar } from "@/components/data/pagination-bar";
import { RowActions } from "@/components/data/row-actions";
import { Toolbar } from "@/components/data/toolbar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EstadoLista } from "@/features/estados/types";
import { paramsDeBusca, recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Estados" };

export default async function EstadosPage({ searchParams }: PageProps<"/estados">) {
  const sessao = await requirePermissao("state");
  const params = paramsDeBusca(await searchParams, [], { ordering: "code" });
  const pagina = await recurso.listar<EstadoLista>("states", params);
  const botaoNovo = pode(sessao, "state", "create") ? (
    <Button asChild>
      <Link href="/estados/novo"><Plus data-icon="inline-start" /> Novo estado</Link>
    </Button>
  ) : undefined;

  return (
    <>
      <PageHeader titulo="Estados" descricao="Unidades federativas usadas no cadastro de cidades." crumbs={[{ label: "Estados" }]} acoes={botaoNovo} />
      <Toolbar placeholder="Buscar por sigla ou nome…" />
      <DataTable
        linhas={pagina.results}
        ordenacaoAtual={params.ordering as string}
        colunas={[
          { chave: "code", titulo: "UF", ordenavel: "code", className: "w-20", render: (e) => <Badge variant="secondary" className="font-mono">{e.code}</Badge> },
          { chave: "name", titulo: "Nome", ordenavel: "name", render: (e) => <Link href={`/estados/${e.id}`} className="font-medium hover:underline">{e.name}</Link> },
          { chave: "created_at", titulo: "Criado em", ordenavel: "created_at", render: (e) => formatarData(e.created_at) },
        ]}
        acoes={(e) => (
          <RowActions
            id={e.id}
            editarHref={`/estados/${e.id}`}
            recurso="states"
            rotulo={`o estado ${e.name}`}
            revalidar={["/estados"]}
            podeEditar={pode(sessao, "state", "update")}
            podeExcluir={pode(sessao, "state", "delete")}
          />
        )}
        vazio={{ titulo: "Nenhum estado encontrado", descricao: "Cadastre os estados antes de criar cidades.", acao: botaoNovo }}
      />
      <PaginationBar pagina={pagina} />
    </>
  );
}

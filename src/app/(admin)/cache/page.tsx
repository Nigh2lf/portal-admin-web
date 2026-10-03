import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LimparCache } from "@/features/cache/limpar-cache";
import type { LimpezaCache, SituacaoCache } from "@/features/cache/types";
import { apiFetch } from "@/lib/api/client";
import { pode, requirePermissao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils/format";

export const metadata = { title: "Cache do site" };

function Alvo({ item, escopos }: { item: LimpezaCache; escopos: SituacaoCache["scopes"] }) {
  if (item.items.length) return <>Imóvel {item.items[item.items.length - 1]}</>;
  const nomes = item.scopes.length ? item.scopes.map((s) => escopos.find((e) => e.value === s)?.label.split(" (")[0] ?? s).join(", ") : "Tudo";
  return <>{nomes}</>;
}

export default async function CachePage() {
  const sessao = await requirePermissao("public_cache");
  const situacao = await apiFetch<SituacaoCache>("/public-cache/");
  const nomePortal = (slug: string) => situacao.portals.find((p) => p.slug === slug)?.name ?? slug;

  return (
    <>
      <PageHeader
        titulo="Cache do site"
        descricao="O cache se renova sozinho quando um dado muda. Use esta tela quando algo não atualizou no site."
        crumbs={[{ label: "Cache do site" }]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Limpar cache</CardTitle>
            <CardDescription>Limpa o cache da API e avisa o site para buscar os dados novos.</CardDescription>
          </CardHeader>
          <CardContent>
            {pode(sessao, "public_cache", "create") ? (
              <LimparCache portais={situacao.portals} escopos={situacao.scopes} />
            ) : (
              <p className="text-sm text-muted-foreground">Seu perfil pode ver esta tela, mas não limpar o cache.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Situação</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Cache da API</dt>
                <dd>{situacao.enabled ? <Badge variant="secondary">Ligado</Badge> : <Badge variant="destructive">Desligado</Badge>}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Armazenamento</dt>
                <dd className="font-mono text-xs">{situacao.backend}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Aviso ao site</dt>
                <dd>{situacao.site_configured ? <Badge variant="secondary">Configurado</Badge> : <Badge variant="destructive">Sem URL</Badge>}</dd>
              </div>
            </dl>
            {situacao.backend === "LocMemCache" && (
              <p className="mt-4 text-xs text-muted-foreground">
                O cache fica na memória de cada processo da API. Com mais de uma instância rodando, troque para Redis.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Últimas limpezas</CardTitle>
          <CardDescription>Manuais e de importações. O histórico recomeça a cada deploy da API.</CardDescription>
        </CardHeader>
        <CardContent>
          {situacao.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma limpeza registrada desde o último deploy.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Quem</TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead>O que</TableHead>
                  <TableHead>Site</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {situacao.history.map((h) => (
                  <TableRow key={`${h.at}-${h.user}`}>
                    <TableCell className="whitespace-nowrap">{formatarData(h.at, true)}</TableCell>
                    <TableCell>{h.origin === "batch" ? <Badge variant="outline">Importação</Badge> : h.user}</TableCell>
                    <TableCell>{h.portal ? nomePortal(h.portal) : "Todos"}</TableCell>
                    <TableCell>
                      <Alvo item={h} escopos={situacao.scopes} />
                    </TableCell>
                    <TableCell>
                      {h.site_ok === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : h.site_ok ? (
                        <Badge variant="secondary">Atualizado</Badge>
                      ) : (
                        <Badge variant="destructive" title={h.site_error}>
                          Falhou
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

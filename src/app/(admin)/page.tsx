import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { NAV } from "@/config/nav";
import {
  daysAgoIso,
  fetchCount,
  fetchSummary,
  type AdvertiserSummary,
  type PropertySummary,
  type UserSummary,
} from "@/features/dashboard/data";
import { MetricCard } from "@/features/dashboard/metric-card";
import { pode, requireSession } from "@/lib/auth/session";

const RECENT_DAYS = 30;

export default async function DashboardPage() {
  const sessao = await requireSession();
  const can = (viewName: string) => pode(sessao, viewName);
  const since = daysAgoIso(RECENT_DAYS);
  const skip = Promise.resolve(null);

  const [users, advertisers, properties, inquiries, recentInquiries, requests, recentRequests, portals, activePortals] =
    await Promise.all([
      can("user") ? fetchSummary<UserSummary>("users") : skip,
      can("advertiser") ? fetchSummary<AdvertiserSummary>("advertisers") : skip,
      can("property") ? fetchSummary<PropertySummary>("properties") : skip,
      can("property_inquiry") ? fetchCount("property-inquiries") : skip,
      can("property_inquiry") ? fetchCount("property-inquiries", { created_at__gte: since }) : skip,
      can("property_request") ? fetchCount("property-requests") : skip,
      can("property_request") ? fetchCount("property-requests", { created_at__gte: since }) : skip,
      can("portal") ? fetchCount("portals") : skip,
      can("portal") ? fetchCount("portals", { is_active: "true" }) : skip,
    ]);

  const recentLabel = `Recebidas nos últimos ${RECENT_DAYS} dias`;

  return (
    <>
      <PageHeader
        titulo={`Olá, ${sessao.name.split(" ")[0] || "admin"}`}
        descricao="Resumo dos portais de imóveis: o que está cadastrado e o que está ativo."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {can("property") ? (
          <MetricCard
            title="Imóveis"
            href="/imoveis"
            total={properties?.total ?? null}
            active={properties ? { value: properties.visible, label: "visíveis no site" } : undefined}
            rows={
              properties
                ? [
                    { label: "De anunciante não publicado", value: properties.hidden_by_advertiser },
                    { label: "Inativos ou rascunho", value: properties.inactive, href: "/imoveis?is_active=false" },
                    { label: "De anunciantes com XML ativo", value: properties.of_xml_advertisers },
                  ]
                : []
            }
          />
        ) : null}
        {can("advertiser") ? (
          <MetricCard
            title="Anunciantes"
            href="/anunciantes"
            total={advertisers?.total ?? null}
            active={advertisers ? { value: advertisers.published, label: "publicados no site" } : undefined}
            rows={
              advertisers
                ? [
                    { label: "Publicados com imóvel no ar", value: advertisers.published_with_properties },
                    {
                      label: "Não publicados",
                      value: advertisers.total - advertisers.published,
                      href: "/anunciantes?is_published=false",
                    },
                    { label: "Com XML ativo", value: advertisers.with_active_xml },
                  ]
                : []
            }
          />
        ) : null}
        {can("user") ? (
          <MetricCard
            title="Usuários"
            href="/usuarios"
            total={users?.total ?? null}
            active={users ? { value: users.logged_in, label: "já acessaram" } : undefined}
            rows={
              users
                ? [
                    { label: "De anunciante publicado", value: users.of_published_advertisers },
                    { label: "Com login liberado", value: users.active },
                    { label: "Administradores", value: users.admins },
                  ]
                : []
            }
          />
        ) : null}
        {can("property_inquiry") ? (
          <MetricCard
            title="Mensagens de imóveis"
            href="/mensagens"
            total={inquiries}
            rows={recentInquiries !== null ? [{ label: recentLabel, value: recentInquiries }] : []}
          />
        ) : null}
        {can("property_request") ? (
          <MetricCard
            title="Encomendas"
            href="/encomendas"
            total={requests}
            rows={recentRequests !== null ? [{ label: recentLabel, value: recentRequests }] : []}
          />
        ) : null}
        {can("portal") ? (
          <MetricCard
            title="Portais"
            href="/portais"
            total={portals}
            active={portals !== null && activePortals !== null ? { value: activePortals, label: "ativos" } : undefined}
          />
        ) : null}
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Atalhos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NAV.flatMap((g) => g.itens)
            .filter((it) => pode(sessao, it.viewName))
            .map((it) => (
              <Link key={it.href} href={it.href} className="rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:bg-accent">
                {it.label}
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}

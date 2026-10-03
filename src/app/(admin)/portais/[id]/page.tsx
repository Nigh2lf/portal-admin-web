import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { urlMidia } from "@/features/comum/midia";
import { PortalForm } from "@/features/portais/portal-form";
import type { PortalDetalhe } from "@/features/portais/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar portal" };

export default async function EditarPortalPage({ params }: PageProps<"/portais/[id]">) {
  await requirePermissao("portal", "update");
  const { id } = await params;
  const [portal, cidades, portais] = await Promise.all([
    recurso.obter<PortalDetalhe>("portals", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("cities").catch(() => []),
    recurso.lookup("portals").catch(() => []),
  ]);
  if (!portal) notFound();
  const comUrlsAbsolutas: PortalDetalhe = {
    ...portal,
    logo_url: urlMidia(portal.logo_url),
    logo_mobile_url: urlMidia(portal.logo_mobile_url),
    og_image_url: urlMidia(portal.og_image_url),
    watermark_url: urlMidia(portal.watermark_url),
  };
  return (
    <>
      <PageHeader titulo={portal.name} descricao={portal.domain} crumbs={[{ label: "Portais", href: "/portais" }, { label: "Editar" }]} />
      <PortalForm portal={comUrlsAbsolutas} cidades={cidades} portais={portais.filter((p) => p.key !== portal.id)} />
    </>
  );
}

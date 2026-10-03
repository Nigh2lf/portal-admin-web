import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BannerForm } from "@/features/banners/banner-form";
import type { BannerDetalhe } from "@/features/banners/types";
import { urlMidia } from "@/features/comum/midia";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar banner" };

export default async function EditarBannerPage({ params }: PageProps<"/banners/[id]">) {
  await requirePermissao("banner", "update");
  const { id } = await params;
  const [banner, portais] = await Promise.all([
    recurso.obter<BannerDetalhe>("banners", id).catch((e) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
    recurso.lookup("portals").catch(() => []),
  ]);
  if (!banner) notFound();
  return (
    <>
      <PageHeader titulo="Editar banner" descricao={banner.portal_name ?? "Todos os portais"} crumbs={[{ label: "Banners do hero", href: "/banners" }, { label: "Editar" }]} />
      <BannerForm banner={{ ...banner, home_image_url: urlMidia(banner.home_image_url), inner_image_url: urlMidia(banner.inner_image_url) }} portais={portais} />
    </>
  );
}

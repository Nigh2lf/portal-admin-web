import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FotosManager } from "@/features/imoveis/fotos-manager";
import type { ImovelDetalhe } from "@/features/imoveis/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { pode, requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Fotos do imóvel" };

export default async function FotosImovelPage({ params }: PageProps<"/imoveis/[id]/fotos">) {
  const sessao = await requirePermissao("property", "update");
  const { id } = await params;
  const imovel = await recurso.obter<ImovelDetalhe>("properties", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!imovel) notFound();
  return (
    <>
      <PageHeader
        titulo={`Fotos · ${imovel.reference_code}`}
        descricao={imovel.title}
        crumbs={[{ label: "Imóveis", href: "/imoveis" }, { label: imovel.reference_code, href: `/imoveis/${imovel.id}` }, { label: "Fotos" }]}
        acoes={
          <Button asChild variant="outline">
            <Link href={`/imoveis/${imovel.id}`}><Pencil data-icon="inline-start" /> Editar imóvel</Link>
          </Button>
        }
      />
      <FotosManager
        imovelId={imovel.id}
        fotosIniciais={imovel.photos}
        podeEnviar={pode(sessao, "property", "create")}
        podeExcluir={pode(sessao, "property", "delete")}
      />
    </>
  );
}

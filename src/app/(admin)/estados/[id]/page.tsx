import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { EstadoForm } from "@/features/estados/estado-form";
import type { EstadoDetalhe } from "@/features/estados/types";
import { ApiError } from "@/lib/api/client";
import { recurso } from "@/lib/api/resources";
import { requirePermissao } from "@/lib/auth/session";

export const metadata = { title: "Editar estado" };

export default async function EditarEstadoPage({ params }: PageProps<"/estados/[id]">) {
  await requirePermissao("state", "update");
  const { id } = await params;
  const estado = await recurso.obter<EstadoDetalhe>("states", id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  });
  if (!estado) notFound();
  return (
    <>
      <PageHeader titulo={`${estado.name} (${estado.code})`} crumbs={[{ label: "Estados", href: "/estados" }, { label: "Editar" }]} />
      <EstadoForm estado={estado} />
    </>
  );
}

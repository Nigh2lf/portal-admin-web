import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { SenhaForm } from "@/features/usuarios/senha-form";
import { requireSession } from "@/lib/auth/session";
import { getUsuarioAtual } from "@/lib/auth/usuario-atual";

export const metadata = { title: "Minha conta" };

export default async function MinhaContaPage() {
  const sessao = await requireSession();
  const usuario = await getUsuarioAtual();
  return (
    <>
      <PageHeader titulo="Minha conta" crumbs={[{ label: "Minha conta" }]} />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">Dados</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Nome</dt><dd>{usuario?.name ?? sessao.name}</dd>
            <dt className="text-muted-foreground">E-mail</dt><dd>{usuario?.email ?? "—"}</dd>
            <dt className="text-muted-foreground">Papel</dt><dd><Badge variant={usuario?.role === "ADMIN" ? "default" : "secondary"}>{usuario?.role ?? sessao.role}</Badge></dd>
            <dt className="text-muted-foreground">Telas liberadas</dt><dd>{Object.values(sessao.permissions).filter((p) => p.read).length}</dd>
          </dl>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">Alterar senha</h2>
          <SenhaForm />
        </section>
      </div>
    </>
  );
}

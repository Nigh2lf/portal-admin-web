import { AdminShell } from "@/components/layout/shell";
import { NAV } from "@/config/nav";
import { sair } from "@/lib/auth/actions";
import { pode, requireSession } from "@/lib/auth/session";
import { getUsuarioAtual } from "@/lib/auth/usuario-atual";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await requireSession();
  const usuario = await getUsuarioAtual();
  const grupos = NAV.map((g) => ({ ...g, itens: g.itens.filter((it) => pode(sessao, it.viewName)) })).filter((g) => g.itens.length);

  return (
    <AdminShell
      grupos={grupos}
      usuario={{ nome: usuario?.name ?? sessao.name, email: usuario?.email ?? "", role: usuario?.role ?? sessao.role, imagem: usuario?.profile_image ?? null }}
      onSair={sair}
    >
      {children}
    </AdminShell>
  );
}

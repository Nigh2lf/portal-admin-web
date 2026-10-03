import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sidebar via-[#24506b] to-primary px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">P</span>
          <div>
            <h1 className="text-lg font-semibold">Portais · Admin</h1>
            <p className="text-sm text-muted-foreground">Entre com sua conta de administrador.</p>
          </div>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}

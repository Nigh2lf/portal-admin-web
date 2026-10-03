import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SemPermissaoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="size-12 text-warning" aria-hidden />
      <h1 className="text-2xl font-semibold">Sem permissão</h1>
      <p className="max-w-md text-muted-foreground">Seu perfil de acesso não libera esta tela. Peça a um administrador para ajustar as permissões do seu perfil.</p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/form/campo";
import { Input } from "@/components/ui/input";
import { entrar } from "@/lib/auth/actions";

export function LoginForm({ next }: { next: string }) {
  const [estado, action, pending] = useActionState(entrar, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      {estado && !estado.ok && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{estado.message}</AlertDescription>
        </Alert>
      )}
      <Campo id="email" rotulo="E-mail">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Campo>
      <Campo id="senha" rotulo="Senha">
        <Input id="senha" name="senha" type="password" autoComplete="current-password" required />
      </Campo>
      <Button type="submit" size="lg" disabled={pending} className="mt-2">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

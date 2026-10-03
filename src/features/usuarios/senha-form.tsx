"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Campo } from "@/components/form/campo";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { alterarMinhaSenha } from "./actions";
import { senhaSchema, type SenhaForm as Valores } from "./schemas";

export function SenhaForm() {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Valores>({
    resolver: zodResolver(senhaSchema),
    defaultValues: { old_password: "", password: "", password_confirm: "" },
  });
  const onSubmit = handleSubmit(async (v) => {
    const r = await alterarMinhaSenha(v);
    if (r.ok) {
      toast.success(r.message);
      reset();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Campo id="old_password" rotulo="Senha atual" erro={errors.old_password?.message} obrigatorio>
        <Input id="old_password" type="password" autoComplete="current-password" {...register("old_password")} />
      </Campo>
      <Campo id="password" rotulo="Nova senha" erro={errors.password?.message} obrigatorio>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
      </Campo>
      <Campo id="password_confirm" rotulo="Confirmar nova senha" erro={errors.password_confirm?.message} obrigatorio>
        <Input id="password_confirm" type="password" autoComplete="new-password" {...register("password_confirm")} />
      </Campo>
      <Button type="submit" disabled={isSubmitting} className="self-end">{isSubmitting ? "Salvando…" : "Alterar senha"}</Button>
    </form>
  );
}

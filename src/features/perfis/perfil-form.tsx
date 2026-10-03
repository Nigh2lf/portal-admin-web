"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Campo, FormSecao } from "@/components/form/campo";
import { FormFooter } from "@/components/form/form-footer";
import { aplicarErros, mensagemErro } from "@/components/form/helpers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NAV } from "@/config/nav";
import { salvarRecurso } from "@/lib/actions/crud";
import { TIPOS_PERMISSAO, type MenuComPermissoes, type PerfilDetalhe } from "./types";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome do perfil."),
  is_active: z.boolean(),
  permissions: z.array(z.string()),
});
type Valores = z.infer<typeof schema>;

const ROTULOS = new Map(NAV.flatMap((g) => g.itens).map((it) => [it.viewName, `${it.label}`]));
ROTULOS.set("user", "Usuários");
ROTULOS.set("profile", "Perfis de acesso");
ROTULOS.set("public_asset", "Imagens públicas");

export function PerfilForm({ perfil, menus }: { perfil: PerfilDetalhe | null; menus: MenuComPermissoes[] }) {
  const router = useRouter();
  const form = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: { name: perfil?.name ?? "", is_active: perfil?.is_active ?? true, permissions: perfil?.permissions ?? [] },
  });
  const { register, control, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = form;
  const selecionadas = useWatch({ control, name: "permissions" });
  const set = useMemo(() => new Set(selecionadas), [selecionadas]);

  const alternar = (ids: string[], marcar: boolean) => {
    const prox = new Set(set);
    for (const id of ids) {
      if (marcar) prox.add(id);
      else prox.delete(id);
    }
    setValue("permissions", [...prox], { shouldDirty: true });
  };

  const menusOrdenados = [...menus].sort((a, b) => (ROTULOS.get(a.view ?? "") ?? a.name).localeCompare(ROTULOS.get(b.view ?? "") ?? b.name, "pt-BR"));
  const todasIds = menus.flatMap((m) => m.permissions.filter((p) => p.type !== "OPTIONS").map((p) => p.id));

  const onSubmit = handleSubmit(async (v) => {
    const r = await salvarRecurso<PerfilDetalhe>("profiles", perfil?.id ?? null, v, ["/perfis"]);
    if (r.ok) {
      toast.success(r.message);
      router.push("/perfis");
      router.refresh();
    } else {
      aplicarErros(setError, r);
      toast.error(mensagemErro(r));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-4xl flex-col gap-6">
      <FormSecao titulo="Perfil">
        <Campo id="name" rotulo="Nome" erro={errors.name?.message} obrigatorio>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
        </Campo>
        <Campo id="is_active" rotulo="Status">
          <Controller control={control} name="is_active" render={({ field }) => (
            <label className="flex h-9 items-center gap-3 text-sm">
              <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
              {field.value ? "Ativo" : "Inativo"}
            </label>
          )} />
        </Campo>
      </FormSecao>

      <section className="rounded-xl border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b p-5">
          <div>
            <h2 className="font-semibold">Permissões por tela</h2>
            <p className="text-sm text-muted-foreground">{set.size} de {todasIds.length} permissões marcadas.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => alternar(todasIds, true)}>Marcar tudo</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => alternar(todasIds, false)}>Limpar</Button>
          </div>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tela</TableHead>
              {TIPOS_PERMISSAO.map((t) => {
                const ids = menus.flatMap((m) => m.permissions.filter((p) => p.type === t.tipo).map((p) => p.id));
                const todas = ids.length > 0 && ids.every((id) => set.has(id));
                return (
                  <TableHead key={t.tipo} className="w-24 text-center">
                    <label className="inline-flex cursor-pointer flex-col items-center gap-1 text-xs">
                      {t.rotulo}
                      <Checkbox checked={todas} onCheckedChange={(c) => alternar(ids, c === true)} aria-label={`${t.rotulo} em todas as telas`} />
                    </label>
                  </TableHead>
                );
              })}
              <TableHead className="w-20 text-center text-xs">Tudo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menusOrdenados.map((m) => {
              const idsLinha = m.permissions.filter((p) => p.type !== "OPTIONS").map((p) => p.id);
              const linhaToda = idsLinha.length > 0 && idsLinha.every((id) => set.has(id));
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <span className="font-medium">{ROTULOS.get(m.view ?? "") ?? m.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{m.view}</span>
                  </TableCell>
                  {TIPOS_PERMISSAO.map((t) => {
                    const p = m.permissions.find((x) => x.type === t.tipo);
                    return (
                      <TableCell key={t.tipo} className="text-center">
                        {p ? <Checkbox checked={set.has(p.id)} onCheckedChange={(c) => alternar([p.id], c === true)} aria-label={`${t.rotulo} ${m.name}`} /> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <Checkbox checked={linhaToda} onCheckedChange={(c) => alternar(idsLinha, c === true)} aria-label={`Tudo em ${m.name}`} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <FormFooter voltarHref="/perfis" salvando={isSubmitting} />
    </form>
  );
}

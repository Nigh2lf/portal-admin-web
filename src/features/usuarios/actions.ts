"use server";

import { revalidatePath } from "next/cache";
import { executar } from "@/lib/actions/helpers";
import { recurso } from "@/lib/api/resources";
import type { ActionResult } from "@/lib/api/types";
import { hashSenha, requireSession } from "@/lib/auth/session";
import type { UsuarioDetalhe } from "./types";
import { senhaSchema, usuarioSchema, type SenhaForm, type UsuarioForm } from "./schemas";

/** Cria/atualiza usuário; a senha vai no formato MD5 maiúsculo exigido pela API. */
export async function salvarUsuario(id: string | null, dados: UsuarioForm): Promise<ActionResult<UsuarioDetalhe>> {
  await requireSession();
  const parsed = usuarioSchema.safeParse(dados);
  if (!parsed.success) return { ok: false, message: "Dados inválidos.", errors: zodParaErros(parsed.error) };
  const { password, password_confirm: _c, ...resto } = parsed.data;
  void _c;
  if (!id && !password) return { ok: false, errors: { password: ["Senha é obrigatória."] } };
  const body: Record<string, unknown> = { ...resto };
  if (password) body.password = hashSenha(password);
  const r = await executar(
    () => (id ? recurso.atualizar<UsuarioDetalhe>("users", id, body) : recurso.criar<UsuarioDetalhe>("users", body)),
    id ? "Usuário atualizado." : "Usuário criado.",
  );
  if (r.ok) revalidatePath("/usuarios");
  return r;
}

export async function alterarMinhaSenha(dados: SenhaForm): Promise<ActionResult> {
  const sessao = await requireSession();
  const parsed = senhaSchema.safeParse(dados);
  if (!parsed.success) return { ok: false, message: "Dados inválidos.", errors: zodParaErros(parsed.error) };
  return executar(
    () => recurso.atualizar("users", sessao.user_id, { old_password: hashSenha(parsed.data.old_password), password: hashSenha(parsed.data.password) }),
    "Senha alterada.",
  );
}

function zodParaErros(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const out: Record<string, string[]> = {};
  for (const i of error.issues) {
    const k = String(i.path[0] ?? "non_field_errors");
    (out[k] ??= []).push(i.message);
  }
  return out;
}

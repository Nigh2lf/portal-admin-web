"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/api/types";
import { autenticar, encerrarSessao } from "./session";

export async function entrar(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const email = String(form.get("email") ?? "");
  const senha = String(form.get("senha") ?? "");
  const next = String(form.get("next") ?? "");
  if (!email || !senha) return { ok: false, message: "Informe e-mail e senha." };
  const r = await autenticar(email, senha);
  if (!r.ok) return { ok: false, message: r.message };
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}

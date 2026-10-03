import "server-only";

import { createHash } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt } from "jose";
import { ACCESS_COOKIE, REFRESH_COOKIE, ApiError, apiFetch } from "@/lib/api/client";
import type { ActionResult, PermissionMap, Session } from "@/lib/api/types";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/** Convenção do backend: o front envia a senha como MD5 hex maiúsculo. */
export function hashSenha(senha: string) {
  return createHash("md5").update(senha, "utf8").digest("hex").toUpperCase();
}

export function decodificarSessao(access: string): Session | null {
  try {
    const p = decodeJwt(access) as Record<string, unknown>;
    return {
      user_id: String(p.user_id ?? ""),
      name: String(p.name ?? ""),
      email: String(p.email ?? ""),
      role: (p.role as Session["role"]) ?? "USER",
      permissions: (p.permissions as PermissionMap) ?? {},
      exp: Number(p.exp ?? 0),
    };
  } catch {
    return null;
  }
}

export async function gravarTokens(access: string, refresh: string) {
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const exp = decodeJwt(access).exp ?? Math.floor(Date.now() / 1000) + 3600;
  jar.set(ACCESS_COOKIE, access, { httpOnly: true, sameSite: "lax", secure, path: "/", expires: new Date(exp * 1000) });
  jar.set(REFRESH_COOKIE, refresh, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: REFRESH_MAX_AGE });
}

export async function limparTokens() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/** Sessão a partir do access token (o proxy renova o token antes de expirar). */
export const getSession = cache(async (): Promise<Session | null> => {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  if (!access) return null;
  const s = decodificarSessao(access);
  if (!s || s.exp * 1000 < Date.now()) return null;
  return s;
});

export async function requireSession(next?: string): Promise<Session> {
  const s = await getSession();
  if (!s) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return s;
}

export function pode(sessao: Session | null, viewName: string, acao: keyof PermissionMap[string] = "read") {
  return Boolean(sessao?.permissions?.[viewName]?.[acao]);
}

export async function requirePermissao(viewName: string, acao: keyof PermissionMap[string] = "read") {
  const s = await requireSession();
  if (!pode(s, viewName, acao)) redirect("/sem-permissao");
  return s;
}

export async function autenticar(email: string, senha: string): Promise<ActionResult<Session>> {
  try {
    const tokens = await apiFetch<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      anonymous: true,
      body: { email: email.trim().toLowerCase(), password: hashSenha(senha) },
    });
    await gravarTokens(tokens.access, tokens.refresh);
    const s = decodificarSessao(tokens.access);
    return s ? { ok: true, data: s } : { ok: false, message: "Token inválido." };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.status === 401 ? "E-mail ou senha inválidos." : e.message };
    }
    return { ok: false, message: "Não foi possível conectar à API." };
  }
}

export async function encerrarSessao() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    await apiFetch("/auth/logout/", { method: "POST", body: { refresh } }).catch(() => undefined);
  }
  await limparTokens();
}

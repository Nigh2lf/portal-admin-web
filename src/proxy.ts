import { NextResponse, type NextRequest } from "next/server";
import { decodeJwt } from "jose";

const ACCESS_COOKIE = "admin_access";
const REFRESH_COOKIE = "admin_refresh";
const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const PUBLICAS = ["/login", "/sem-permissao"];
const MARGEM_RENOVACAO_S = 120;

function expiraEm(token: string | undefined) {
  if (!token) return 0;
  try {
    return (decodeJwt(token).exp ?? 0) * 1000;
  } catch {
    return 0;
  }
}

/**
 * Protege as rotas do admin e renova o access token quando está perto de
 * expirar, usando o refresh token (rotação + blacklist no backend).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publica = PUBLICAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessValido = expiraEm(access) > Date.now() + MARGEM_RENOVACAO_S * 1000;

  if (accessValido) {
    if (pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (refresh) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
      });
      if (res.ok) {
        const tokens = (await res.json()) as { access: string; refresh?: string };
        const response = pathname === "/login" ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
        const secure = process.env.NODE_ENV === "production";
        response.cookies.set(ACCESS_COOKIE, tokens.access, {
          httpOnly: true,
          sameSite: "lax",
          secure,
          path: "/",
          expires: new Date(expiraEm(tokens.access) || Date.now() + 3600_000),
        });
        if (tokens.refresh) {
          response.cookies.set(REFRESH_COOKIE, tokens.refresh, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 30 });
        }
        return response;
      }
    } catch {
      // API fora do ar: cai para o fluxo de login abaixo.
    }
  }

  if (publica) return NextResponse.next();

  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname + request.nextUrl.search);
  const response = NextResponse.redirect(login);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};

import "server-only";

import { cache } from "react";
import { apiFetch } from "@/lib/api/client";

export interface UsuarioAtual {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  profile_image: string | null;
}

/** Dados do usuário logado (`/users/profile/`); o token só traz nome e permissões. */
export const getUsuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  try {
    return await apiFetch<UsuarioAtual>("/users/profile/");
  } catch {
    return null;
  }
});

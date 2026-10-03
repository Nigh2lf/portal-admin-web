export interface UsuarioLista {
  id: string;
  email: string;
  name: string | null;
  profile_image: string | null;
  is_active: boolean;
  role: "ADMIN" | "USER";
  created_at: string;
}

export interface UsuarioDetalhe extends UsuarioLista {
  email_verified: boolean;
  profiles: string[];
  updated_at: string;
}

export const PAPEIS: Array<{ value: "ADMIN" | "USER"; label: string; descricao: string }> = [
  { value: "ADMIN", label: "Administrador", descricao: "Pode gerenciar usuários, papéis e redefinir senhas." },
  { value: "USER", label: "Usuário", descricao: "Acesso limitado às telas liberadas pelo perfil." },
];

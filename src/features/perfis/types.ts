export interface PerfilLista {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface PerfilDetalhe extends PerfilLista {
  permissions: string[];
  updated_at: string;
}

export type TipoPermissao = "READ" | "CREATE" | "UPDATE" | "DELETE" | "OPTIONS";

export interface PermissaoMenu {
  id: string;
  menu: string;
  name: string;
  type: TipoPermissao;
}

export interface MenuComPermissoes {
  id: string;
  name: string;
  view: string | null;
  permissions: PermissaoMenu[];
}

export const TIPOS_PERMISSAO: Array<{ tipo: TipoPermissao; rotulo: string }> = [
  { tipo: "READ", rotulo: "Ver" },
  { tipo: "CREATE", rotulo: "Criar" },
  { tipo: "UPDATE", rotulo: "Editar" },
  { tipo: "DELETE", rotulo: "Excluir" },
];

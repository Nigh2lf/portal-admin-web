/** Envelope padrão da API: `{success, status, message, data, error}`. */
export interface Envelope<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  error: Record<string, string[]> | { detail?: string } | null;
}

export interface Paginated<T> {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LookupOption {
  key: string;
  value: string;
}

export type Crud = { create: boolean; read: boolean; update: boolean; delete: boolean };
export type PermissionMap = Record<string, Crud>;

export interface Session {
  user_id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  permissions: PermissionMap;
  exp: number;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [filtro: string]: string | number | boolean | undefined;
}

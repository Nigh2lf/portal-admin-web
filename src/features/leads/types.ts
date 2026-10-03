/** Tipos dos leads somente leitura (`GET`/`DELETE`), conforme docs dos módulos da API. */

export interface MensagemLista {
  id: string;
  name: string;
  email: string;
  phone: string;
  advertiser: string;
  advertiser_name: string;
  portal: string;
  portal_name: string;
  property: string | null;
  property_reference_code: string;
  forwarded_to_crm_at: string | null;
  created_at: string;
}

export interface MensagemDetalhe extends MensagemLista {
  message: string;
  contact_preferences: string[];
  property_title: string | null;
  ip_address: string | null;
  referer: string;
  is_mobile: boolean;
  legacy_id: number | null;
  updated_at: string;
}

export interface ContatoLista {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  portal: string;
  portal_name: string;
  created_at: string;
}

export interface ContatoDetalhe extends ContatoLista {
  message: string;
  ip_address: string | null;
  legacy_id: number | null;
  updated_at: string;
}

export type Finalidade = "SALE" | "RENT" | "SEASONAL";
export type Financiamento = "FINANCING" | "CASH" | "FGTS" | "EXCHANGE" | "";

export interface EncomendaLista {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: Finalidade;
  portal: string;
  portal_name: string;
  advertiser: string | null;
  advertiser_name: string | null;
  property_type: string | null;
  property_type_name: string | null;
  city: string | null;
  city_name: string | null;
  neighborhood: string | null;
  neighborhood_name: string | null;
  min_price: string | null;
  max_price: string | null;
  is_partner_broadcast: boolean;
  created_at: string;
}

export interface EncomendaDetalhe extends EncomendaLista {
  funding: Financiamento;
  message: string;
  is_in_condominium: boolean | null;
  ip_address: string | null;
  legacy_id: number | null;
  updated_at: string;
}

export interface LeadAnuncianteLista {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  portal: string;
  portal_name: string;
  created_at: string;
}

export interface LeadAnuncianteDetalhe extends LeadAnuncianteLista {
  message: string;
  legacy_id: number | null;
  updated_at: string;
}

export const FINALIDADES: Record<Finalidade, string> = { SALE: "Venda", RENT: "Locação", SEASONAL: "Temporada" };

export const FINANCIAMENTOS: Record<Exclude<Financiamento, "">, string> = {
  FINANCING: "Financiamento",
  CASH: "À vista",
  FGTS: "FGTS",
  EXCHANGE: "Permuta",
};

export const CANAIS_CONTATO: Record<string, string> = { PHONE: "Telefone", WHATSAPP: "WhatsApp", EMAIL: "E-mail" };

export function rotuloFinalidade(p: string) {
  return FINALIDADES[p as Finalidade] ?? p;
}

export function rotuloFinanciamento(f: string) {
  return f ? (FINANCIAMENTOS[f as Exclude<Financiamento, "">] ?? f) : "—";
}

export function rotuloCanal(c: string) {
  return CANAIS_CONTATO[c] ?? c;
}

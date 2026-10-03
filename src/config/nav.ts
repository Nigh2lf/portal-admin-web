export type IconeNav =
  | "dashboard" | "users" | "shield" | "globe" | "image" | "megaphone" | "layout" | "map" | "building" | "pin"
  | "briefcase" | "creditcard" | "plug" | "home" | "tag" | "sparkles" | "ban" | "inbox" | "mail" | "search"
  | "handshake" | "lightbulb" | "newspaper" | "download" | "clock";

export interface ItemNav {
  label: string;
  href: string;
  /** `view_name` do backend; o item só aparece se a sessão tiver READ nele. */
  viewName: string;
  icon: IconeNav;
}

export interface GrupoNav {
  titulo: string;
  itens: ItemNav[];
}

export const NAV: GrupoNav[] = [
  {
    titulo: "Acesso",
    itens: [
      { label: "Usuários", href: "/usuarios", viewName: "user", icon: "users" },
      { label: "Perfis de acesso", href: "/perfis", viewName: "profile", icon: "shield" },
    ],
  },
  {
    titulo: "Portais",
    itens: [
      { label: "Portais", href: "/portais", viewName: "portal", icon: "globe" },
      { label: "Banners do hero", href: "/banners", viewName: "banner", icon: "image" },
      { label: "Espaços publicitários", href: "/espacos-publicitarios", viewName: "ad_placement", icon: "layout" },
      { label: "Anúncios", href: "/anuncios", viewName: "ad", icon: "megaphone" },
    ],
  },
  {
    titulo: "Localização",
    itens: [
      { label: "Estados", href: "/estados", viewName: "state", icon: "map" },
      { label: "Cidades", href: "/cidades", viewName: "city", icon: "building" },
      { label: "Bairros", href: "/bairros", viewName: "neighborhood", icon: "pin" },
    ],
  },
  {
    titulo: "Anunciantes",
    itens: [
      { label: "Anunciantes", href: "/anunciantes", viewName: "advertiser", icon: "briefcase" },
      { label: "Planos", href: "/planos", viewName: "plan", icon: "creditcard" },
      { label: "Integradores", href: "/integradores", viewName: "integrator", icon: "plug" },
    ],
  },
  {
    titulo: "Imóveis",
    itens: [
      { label: "Imóveis", href: "/imoveis", viewName: "property", icon: "home" },
      { label: "Tipos de imóvel", href: "/tipos-de-imovel", viewName: "property_type", icon: "tag" },
      { label: "Características", href: "/caracteristicas", viewName: "feature", icon: "sparkles" },
      { label: "Imóveis rejeitados", href: "/imoveis-rejeitados", viewName: "rejected_property", icon: "ban" },
    ],
  },
  {
    titulo: "Leads",
    itens: [
      { label: "Mensagens de imóveis", href: "/mensagens", viewName: "property_inquiry", icon: "inbox" },
      { label: "Contatos do site", href: "/contatos", viewName: "contact_message", icon: "mail" },
      { label: "Encomendas", href: "/encomendas", viewName: "property_request", icon: "search" },
      { label: "Leads de anunciantes", href: "/leads-anunciantes", viewName: "advertiser_lead", icon: "handshake" },
      { label: "Remetentes bloqueados", href: "/bloqueios", viewName: "blocked_sender", icon: "ban" },
    ],
  },
  {
    titulo: "Conteúdo",
    itens: [
      { label: "Dicas", href: "/dicas", viewName: "tip", icon: "lightbulb" },
      { label: "Blog", href: "/blog", viewName: "blog_post", icon: "newspaper" },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { label: "Importações XML", href: "/importacoes", viewName: "xml_import_run", icon: "download" },
      { label: "Tarefas agendadas", href: "/tarefas", viewName: "scheduled_task_run", icon: "clock" },
    ],
  },
];

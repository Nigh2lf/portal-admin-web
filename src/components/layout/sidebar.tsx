"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ban, BarChart3, Briefcase, Building2, Clock, CreditCard, Download, Globe, Handshake, Home, Image as ImageIcon,
  Inbox, LayoutTemplate, Lightbulb, Mail, Map, MapPin, Megaphone, Newspaper, Plug, Search, ShieldCheck, Sparkles,
  Tag, Users, type LucideIcon,
} from "lucide-react";
import type { GrupoNav, IconeNav } from "@/config/nav";
import { cn } from "@/lib/utils";

const ICONES: Record<IconeNav, LucideIcon> = {
  dashboard: BarChart3, users: Users, shield: ShieldCheck, globe: Globe, image: ImageIcon, megaphone: Megaphone,
  layout: LayoutTemplate, map: Map, building: Building2, pin: MapPin, briefcase: Briefcase, creditcard: CreditCard,
  plug: Plug, home: Home, tag: Tag, sparkles: Sparkles, ban: Ban, inbox: Inbox, mail: Mail, search: Search,
  handshake: Handshake, lightbulb: Lightbulb, newspaper: Newspaper, download: Download, clock: Clock,
};

export function SidebarNav({ grupos, onNavigate }: { grupos: GrupoNav[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5" aria-label="Menu principal">
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
          pathname === "/" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <BarChart3 className="size-4" aria-hidden /> Visão geral
      </Link>
      {grupos.map((g) => (
        <div key={g.titulo}>
          <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">{g.titulo}</p>
          <ul className="flex flex-col gap-0.5">
            {g.itens.map((it) => {
              const Icon = ICONES[it.icon];
              const ativo = pathname === it.href || pathname.startsWith(`${it.href}/`);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    aria-current={ativo ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      ativo ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, UserRound } from "lucide-react";
import type { GrupoNav } from "@/config/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { iniciais } from "@/lib/utils/format";
import { SidebarNav } from "./sidebar";

interface Props {
  grupos: GrupoNav[];
  usuario: { nome: string; email: string; role: string; imagem: string | null };
  onSair: () => Promise<void>;
  children: React.ReactNode;
}

export function AdminShell({ grupos, usuario, onSair, children }: Props) {
  const [aberto, setAberto] = useState(false);
  const marca = (
    <Link href="/" className="flex items-center gap-2 px-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">P</span>
      <span className="text-sm font-semibold text-sidebar-foreground">Portais · Admin</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
        {marca}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav grupos={grupos} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:px-6">
          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
              <SheetHeader className="border-b border-sidebar-border">
                <SheetTitle className="text-sidebar-foreground">Portais · Admin</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto px-3 py-4">
                <SidebarNav grupos={grupos} onNavigate={() => setAberto(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="size-7">
                    {usuario.imagem && <AvatarImage src={usuario.imagem} alt="" />}
                    <AvatarFallback className="text-xs">{iniciais(usuario.nome || usuario.email)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">{usuario.nome || usuario.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-medium">{usuario.nome || "Usuário"}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{usuario.email}</p>
                  <p className="mt-1 text-[11px] font-normal text-muted-foreground">Papel: {usuario.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/minha-conta">
                    <UserRound /> Minha conta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => void onSair()}>
                  <LogOut /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

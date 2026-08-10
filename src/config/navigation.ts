import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  LibraryBig,
  PenLine,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  to: string;
  params?: Record<string, string>;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", to: "/", icon: LayoutDashboard },
      { title: "Nova Oferta", to: "/nova-oferta", icon: Sparkles },
      { title: "Minhas Ofertas", to: "/ofertas", icon: FolderKanban },
      { title: "Templates", to: "/templates", icon: LibraryBig },
    ],
  },
  {
    label: "Criação",
    items: [
      { title: "IA Copywriter", to: "/copywriter", icon: PenLine },
      { title: "Validador de Oferta", to: "/validador", icon: ShieldCheck },
    ],
  },
  {
    label: "Conta",
    items: [
      { title: "Biblioteca", to: "/biblioteca", icon: LibraryBig },
      { title: "Configurações", to: "/configuracoes", icon: Settings },
    ],
  },
];

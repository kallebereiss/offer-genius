import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  LibraryBig,
  PenLine,
  Package,
  MonitorSmartphone,
  Images,
  Workflow,
  Gift,
  ShieldCheck,
  UserRound,
  Search,
  Swords,
  Gauge,
  BookMarked,
  History,
  Settings,
  CircleUser,
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
      { title: "Criador de Produto", to: "/em-breve/$slug", params: { slug: "criador-de-produto" }, icon: Package },
      { title: "Landing Pages", to: "/em-breve/$slug", params: { slug: "landing-pages" }, icon: MonitorSmartphone },
      { title: "Criativos", to: "/em-breve/$slug", params: { slug: "criativos" }, icon: Images },
      { title: "Funis", to: "/em-breve/$slug", params: { slug: "funis" }, icon: Workflow },
      { title: "Bônus", to: "/em-breve/$slug", params: { slug: "bonus" }, icon: Gift },
      { title: "Garantias", to: "/em-breve/$slug", params: { slug: "garantias" }, icon: ShieldCheck },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { title: "Avatar", to: "/em-breve/$slug", params: { slug: "avatar" }, icon: UserRound },
      { title: "Pesquisa de Mercado", to: "/em-breve/$slug", params: { slug: "pesquisa-de-mercado" }, icon: Search },
      { title: "Análise da Concorrência", to: "/em-breve/$slug", params: { slug: "analise-da-concorrencia" }, icon: Swords },
      { title: "Validador", to: "/em-breve/$slug", params: { slug: "validador" }, icon: Gauge },
    ],
  },
  {
    label: "Conta",
    items: [
      { title: "Biblioteca", to: "/em-breve/$slug", params: { slug: "biblioteca" }, icon: BookMarked },
      { title: "Histórico", to: "/em-breve/$slug", params: { slug: "historico" }, icon: History },
      { title: "Configurações", to: "/configuracoes", icon: Settings },
      { title: "Perfil", to: "/em-breve/$slug", params: { slug: "perfil" }, icon: CircleUser },
    ],
  },
];

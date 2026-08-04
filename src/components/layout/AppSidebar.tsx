import { Link, useRouterState } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_GROUPS } from "@/config/navigation";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, params?: Record<string, string>) => {
    if (params?.["slug"]) return pathname === `/em-breve/${params["slug"]}`;
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
            <Zap className="size-4" />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">LowTicket AI</span>
              <span className="text-[11px] text-muted-foreground">Ofertas que vendem</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to, item.params)}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.to}
                        params={item.params as never}
                        className="flex items-center gap-2.5"
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

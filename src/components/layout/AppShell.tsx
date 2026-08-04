import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Sparkles } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { useTheme } from "@/lib/projects-store";

type AppShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, description, actions, children }: AppShellProps) {
  const { theme, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 glass-panel flex h-14 items-center gap-3 border-x-0 border-t-0 px-3 sm:px-6">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
              {description && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label="Alternar tema"
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
                <Link to="/nova-oferta">
                  <Sparkles className="size-4" />
                  Nova oferta
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-6xl animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Sparkles, LogOut } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { signOut } from "@/lib/auth.functions";
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
  const navigate = useNavigate();
  const router = useRouter();
  const runSignOut = useServerFn(signOut);

  const handleSignOut = async () => {
    await runSignOut();
    await router.invalidate();
    navigate({ to: "/login" });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <a
          href="#conteudo-principal"
          className="sr-only rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
        >
          Pular para o conteúdo
        </a>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sair"
                className="rounded-full"
              >
                <LogOut className="size-4" />
              </Button>
              <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
                <Link to="/nova-oferta">
                  <Sparkles className="size-4" />
                  Nova oferta
                </Link>
              </Button>
            </div>
          </header>
          <main id="conteudo-principal" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-6xl animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

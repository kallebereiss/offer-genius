import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  deleteProject,
  duplicateProject,
  updateProject,
  useHydrated,
  useProjects,
} from "@/lib/projects-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ofertas/")({
  head: () => ({
    meta: [
      { title: "Minhas Ofertas — LowTicket AI" },
      {
        name: "description",
        content:
          "Gerencie, favorite, duplique e valide todas as suas ofertas low ticket criadas com inteligência artificial.",
      },
      { property: "og:title", content: "Minhas Ofertas — LowTicket AI" },
      {
        property: "og:description",
        content: "Todas as suas ofertas digitais em um só lugar.",
      },
    ],
  }),
  component: OfertasPage,
});

function OfertasPage() {
  const projects = useProjects();
  const hydrated = useHydrated();

  return (
    <AppShell title="Minhas Ofertas" description="Todos os seus projetos gerados por IA">
      {!hydrated ? null : projects.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <h2 className="font-display text-2xl">Sua biblioteca está vazia</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Crie sua primeira oferta e a IA entrega produto, copy, página de vendas, funil, bônus e
            criativos prontos.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link to="/nova-oferta">
              <Sparkles className="size-4" /> Criar primeira oferta
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className={cn(
                "surface-card flex flex-col p-5 hover:-translate-y-0.5 hover:shadow-elevated",
                project.archived && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline">{project.brief.nicho}</Badge>
                <button
                  type="button"
                  aria-label="Favoritar"
                  onClick={() => updateProject(project.id, { favorite: !project.favorite })}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Star
                    className={cn("size-4", project.favorite && "fill-primary text-primary")}
                  />
                </button>
              </div>

              <Link
                to="/ofertas/$id"
                params={{ id: project.id }}
                className="mt-3 block flex-1"
              >
                <h3 className="text-base font-semibold leading-snug">
                  {project.offer.productName}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.offer.bigPromise}
                </p>
              </Link>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Score da oferta</span>
                  <span className="font-medium text-foreground">
                    {project.offer.score?.total ?? 0}/100
                  </span>
                </div>
                <Progress value={project.offer.score?.total ?? 0} className="h-1.5" />
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>
                  {project.brief.formato} · {project.brief.preco}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Duplicar"
                    onClick={() => {
                      duplicateProject(project.id);
                      toast.success("Oferta duplicada");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    onClick={() => {
                      deleteProject(project.id);
                      toast.success("Oferta excluída");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

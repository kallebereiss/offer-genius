import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Copy, Search, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfertasPage,
});

type Filter = "todas" | "favoritas" | "arquivadas";

function OfertasPage() {
  const projects = useProjects();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects
      .filter((p) =>
        filter === "favoritas" ? p.favorite : filter === "arquivadas" ? p.archived : !p.archived,
      )
      .filter(
        (p) =>
          !term ||
          p.offer.productName.toLowerCase().includes(term) ||
          p.offer.bigPromise.toLowerCase().includes(term) ||
          p.brief.nicho.toLowerCase().includes(term),
      );
  }, [projects, query, filter]);

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
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Label htmlFor="busca-ofertas" className="sr-only">
                Buscar ofertas
              </Label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="busca-ofertas"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, promessa ou nicho..."
                className="pl-9"
              />
            </div>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
              <TabsList>
                <TabsTrigger value="todas">Ativas</TabsTrigger>
                <TabsTrigger value="favoritas">Favoritas</TabsTrigger>
                <TabsTrigger value="arquivadas">Arquivadas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {visible.length === 0 ? (
            <div className="surface-card p-10 text-center text-sm text-muted-foreground">
              Nenhuma oferta encontrada com esses filtros.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((project) => (
                <article
                  key={project.id}
                  className={cn(
                    "surface-card flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated",
                    project.archived && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline">{project.brief.nicho}</Badge>
                    <button
                      type="button"
                      aria-label={
                        project.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
                      }
                      onClick={() => updateProject(project.id, { favorite: !project.favorite })}
                      className="rounded-md text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Star
                        className={cn("size-4", project.favorite && "fill-primary text-primary")}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <Link to="/ofertas/$id" params={{ id: project.id }} className="mt-3 block flex-1">
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
                        aria-label={project.archived ? "Desarquivar oferta" : "Arquivar oferta"}
                        onClick={() => {
                          updateProject(project.id, { archived: !project.archived });
                          toast.success(
                            project.archived ? "Oferta restaurada" : "Oferta arquivada",
                          );
                        }}
                      >
                        {project.archived ? (
                          <ArchiveRestore className="size-4" aria-hidden="true" />
                        ) : (
                          <Archive className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Duplicar oferta"
                        onClick={() => {
                          duplicateProject(project.id);
                          toast.success("Oferta duplicada");
                        }}
                      >
                        <Copy className="size-4" aria-hidden="true" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Excluir oferta">
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir esta oferta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              “{project.offer.productName}” será removida definitivamente, junto com
                              a página de vendas e todos os materiais gerados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteProject(project.id);
                                toast.success("Oferta excluída");
                              }}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FolderKanban, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { NAV_GROUPS } from "@/config/navigation";
import { useProjects } from "@/lib/projects-store";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const projects = useProjects();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca rápida (Ctrl+K)"
        className="hidden gap-2 text-muted-foreground md:inline-flex"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="text-xs">Buscar…</span>
        <kbd className="rounded border bg-muted px-1 text-[10px] font-medium">Ctrl K</kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas e ofertas..." />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          {NAV_GROUPS.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.to}
                  value={`${group.label} ${item.title}`}
                  onSelect={() => {
                    setOpen(false);
                    void navigate({ to: item.to });
                  }}
                >
                  <item.icon className="mr-2 size-4" aria-hidden="true" />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {projects.length > 0 && (
            <CommandGroup heading="Minhas ofertas">
              {projects.slice(0, 20).map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.offer.productName} ${project.brief.nicho}`}
                  onSelect={() => {
                    setOpen(false);
                    void navigate({ to: "/ofertas/$id", params: { id: project.id } });
                  }}
                >
                  <FolderKanban className="mr-2 size-4" aria-hidden="true" />
                  {project.offer.productName}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

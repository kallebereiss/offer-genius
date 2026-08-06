import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHydrated, useProjects } from "@/lib/projects-store";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — LowTicket AI" },
      {
        name: "description",
        content: "Todos os módulos, bônus, criativos e e-mails gerados em um só lugar.",
      },
      { property: "og:title", content: "Biblioteca — LowTicket AI" },
      {
        property: "og:description",
        content: "Sua biblioteca de materiais gerados por IA.",
      },
    ],
  }),
  component: BibliotecaPage,
});

function SourceLink({ offerId, offerName }: { offerId: string; offerName: string }) {
  return (
    <Link
      to="/ofertas/$id"
      params={{ id: offerId }}
      className="mt-3 inline-block text-xs font-medium text-primary underline underline-offset-4"
    >
      {offerName}
    </Link>
  );
}

function BibliotecaPage() {
  const projects = useProjects();
  const hydrated = useHydrated();

  const modules = projects.flatMap((p) =>
    p.offer.productModules.map((m) => ({ ...m, offerId: p.id, offerName: p.offer.productName })),
  );
  const bonuses = projects.flatMap((p) =>
    p.offer.bonuses.map((b) => ({ ...b, offerId: p.id, offerName: p.offer.productName })),
  );
  const creatives = projects.flatMap((p) =>
    p.offer.creatives.map((c) => ({ ...c, offerId: p.id, offerName: p.offer.productName })),
  );
  const emails = projects.flatMap((p) =>
    p.offer.emails.map((e) => ({ ...e, offerId: p.id, offerName: p.offer.productName })),
  );

  return (
    <AppShell title="Biblioteca" description="Todos os materiais gerados, de todas as suas ofertas">
      {!hydrated ? null : projects.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <h2 className="font-display text-2xl">Sua biblioteca está vazia</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Gere sua primeira oferta e os módulos, bônus, criativos e e-mails aparecem aqui
            automaticamente.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link to="/nova-oferta">
              <Sparkles className="size-4" />
              Criar oferta
            </Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="modulos">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="modulos">Módulos ({modules.length})</TabsTrigger>
            <TabsTrigger value="bonus">Bônus ({bonuses.length})</TabsTrigger>
            <TabsTrigger value="criativos">Criativos ({creatives.length})</TabsTrigger>
            <TabsTrigger value="emails">E-mails ({emails.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="modulos" className="mt-4 grid gap-4 md:grid-cols-2">
            {modules.map((m, i) => (
              <div key={i} className="surface-card p-5">
                <p className="text-sm font-semibold">{m.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                <SourceLink offerId={m.offerId} offerName={m.offerName} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bonus" className="mt-4 grid gap-4 md:grid-cols-2">
            {bonuses.map((b, i) => (
              <div key={i} className="surface-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{b.title}</p>
                  <Badge variant="outline">{b.perceivedValue}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                <SourceLink offerId={b.offerId} offerName={b.offerName} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="criativos" className="mt-4 grid gap-4 md:grid-cols-2">
            {creatives.map((c, i) => (
              <div key={i} className="surface-card p-5">
                <Badge variant="secondary">{c.format}</Badge>
                <p className="mt-2 text-sm font-semibold">{c.hook}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.script}</p>
                <SourceLink offerId={c.offerId} offerName={c.offerName} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="emails" className="mt-4 grid gap-4 md:grid-cols-2">
            {emails.map((e, i) => (
              <div key={i} className="surface-card p-5">
                <p className="text-sm font-semibold">{e.subject}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{e.body}</p>
                <SourceLink offerId={e.offerId} offerName={e.offerName} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}

import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Download, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { updateOffer, useHydrated, useProject } from "@/lib/projects-store";
import { offerToMarkdown } from "@/lib/export-offer";
import { offerToLandingHtml } from "@/lib/export-landing";

export const Route = createFileRoute("/_authenticated/ofertas/$id")({
  head: () => ({
    meta: [
      { title: "Oferta gerada — LowTicket AI" },
      {
        name: "description",
        content:
          "Edite, valide e exporte sua oferta low ticket: copy, página de vendas, funil, bônus, garantia e criativos.",
      },
      { property: "og:title", content: "Oferta gerada — LowTicket AI" },
      {
        property: "og:description",
        content: "Sua oferta completa, editável e pronta para exportar.",
      },
    ],
  }),
  component: OfertaDetalhe,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OfertaDetalhe() {
  const { id } = useParams({ from: "/_authenticated/ofertas/$id" });
  const project = useProject(id);
  const hydrated = useHydrated();

  if (!hydrated) return null;

  if (!project) {
    return (
      <AppShell title="Oferta não encontrada">
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Essa oferta não existe mais.</p>
          <Button asChild className="mt-4">
            <Link to="/ofertas">Voltar para minhas ofertas</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const { offer, brief } = project;

  const slug = offer.productName.toLowerCase().replace(/\s+/g, "-");

  const download = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    download(offerToMarkdown(project), "text/markdown", `${slug}.md`);
    toast.success("Materiais exportados");
  };

  const handleDownloadLanding = () => {
    download(offerToLandingHtml(project), "text/html", `${slug}-pagina-de-vendas.html`);
    toast.success("Página de vendas baixada");
  };

  const handlePreviewLanding = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Permita pop-ups para visualizar a página.");
      return;
    }
    win.document.write(offerToLandingHtml(project));
    win.document.close();
  };


  return (
    <AppShell
      title={offer.productName}
      description={`${brief.nicho} · ${brief.formato} · ${brief.preco}`}
      actions={
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="size-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      }
    >
      <div className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="size-3" /> Gerado por IA
          </Badge>
          <Badge variant="outline">{brief.objetivo}</Badge>
          <Badge variant="outline">Score {offer.score?.total ?? 0}/100</Badge>
        </div>
        <Input
          value={offer.productName}
          onChange={(event) => updateOffer(id, { productName: event.target.value })}
          className="mt-4 h-auto border-0 px-0 font-display text-3xl shadow-none focus-visible:ring-0"
        />
        <Input
          value={offer.slogan}
          onChange={(event) => updateOffer(id, { slogan: event.target.value })}
          className="mt-1 h-auto border-0 px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
        />
        <Textarea
          value={offer.bigPromise}
          onChange={(event) => updateOffer(id, { bigPromise: event.target.value })}
          rows={2}
          className="mt-4 resize-none bg-muted/40"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Edições são salvas automaticamente na sua conta.
        </p>
      </div>

      <Tabs defaultValue="oferta">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="oferta">Oferta</TabsTrigger>
          <TabsTrigger value="copy">Copy</TabsTrigger>
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="funil">Funil</TabsTrigger>
          <TabsTrigger value="criativos">Criativos</TabsTrigger>
          <TabsTrigger value="mercado">Mercado</TabsTrigger>
          <TabsTrigger value="validador">Validador</TabsTrigger>
        </TabsList>

        <TabsContent value="oferta" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Section title="Posicionamento">
            <p className="text-sm text-muted-foreground">{offer.positioning}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tom de voz:</span> {offer.toneOfVoice}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Avatar:</span> {offer.avatar}
            </p>
          </Section>
          <Section title="Preço, urgência e escassez">
            <p className="text-sm text-muted-foreground">{offer.priceStrategy}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Urgência:</span> {offer.urgency}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Escassez:</span> {offer.scarcity}
            </p>
          </Section>
          <Section title="Módulos do produto">
            <ul className="space-y-3">
              {offer.productModules.map((module) => (
                <li key={module.title}>
                  <p className="text-sm font-medium">{module.title}</p>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Bônus">
            <ul className="space-y-3">
              {offer.bonuses.map((bonus) => (
                <li key={bonus.title} className="rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{bonus.title}</p>
                    <Badge variant="secondary">{bonus.perceivedValue}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{bonus.description}</p>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Garantia">
            <p className="text-sm font-medium">{offer.guarantee.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{offer.guarantee.description}</p>
          </Section>
          <Section title="Sugestões de nome">
            <div className="flex flex-wrap gap-2">
              {offer.nameIdeas.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="copy" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Section title="Headline">
            <Textarea
              value={offer.headline}
              onChange={(event) => updateOffer(id, { headline: event.target.value })}
              rows={2}
              className="resize-none"
            />
            <Textarea
              value={offer.subheadline}
              onChange={(event) => updateOffer(id, { subheadline: event.target.value })}
              rows={2}
              className="mt-3 resize-none"
            />
          </Section>
          <Section title="CTAs">
            <List items={offer.ctas} />
          </Section>
          <Section title="Bullets de benefício">
            <List items={offer.bullets} />
          </Section>
          <Section title="Quebra de objeções">
            <Accordion type="single" collapsible>
              {offer.objections.map((item, index) => (
                <AccordionItem key={item.objection} value={`obj-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {item.objection}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
          <Section title="E-mails da sequência">
            <ul className="space-y-3">
              {offer.emails.map((email) => (
                <li key={email.subject} className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-sm font-medium">{email.subject}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {email.body}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="FAQ">
            <Accordion type="single" collapsible>
              {offer.faq.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        </TabsContent>

        <TabsContent value="landing" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handlePreviewLanding} className="gap-1.5">
              <ExternalLink className="size-4" /> Visualizar página completa
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadLanding} className="gap-1.5">
              <Download className="size-4" /> Baixar HTML
            </Button>
          </div>
          <div className="surface-card overflow-hidden">
            <div
              className="border-b px-6 py-12 text-center"
              style={{ backgroundImage: "var(--gradient-subtle)" }}
            >
              <h2 className="font-display text-3xl sm:text-4xl">{offer.landing.heroHeadline}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
                {offer.landing.heroSubheadline}
              </p>
              <Button className="mt-6 shadow-glow">{offer.landing.finalCta}</Button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Section title="Seção de dores">
                <p className="text-sm text-muted-foreground">{offer.landing.painSection}</p>
              </Section>
              <Section title="Seção de desejos">
                <p className="text-sm text-muted-foreground">{offer.landing.desireSection}</p>
              </Section>
              <Section title="Transformação">
                <p className="text-sm text-muted-foreground">{offer.landing.transformation}</p>
              </Section>
              <Section title="Stack de valor">
                <List items={offer.landing.stack} />
              </Section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="funil" className="mt-4 grid gap-4">
          <Section title="Funil completo">
            <ol className="space-y-4">
              {offer.funnel.map((stage, index) => (
                <li key={stage.stage} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{stage.stage}</p>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Plano de lançamento">
            <List items={offer.launchPlan} />
          </Section>
        </TabsContent>

        <TabsContent value="criativos" className="mt-4 grid gap-4 md:grid-cols-2">
          {offer.creatives.map((creative) => (
            <Section key={creative.hook} title={creative.format}>
              <p className="text-sm font-medium">{creative.hook}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {creative.script}
              </p>
            </Section>
          ))}
        </TabsContent>

        <TabsContent value="mercado" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Section title="Tendências">
            <List items={offer.marketResearch.trends} />
          </Section>
          <Section title="Principais dores">
            <List items={offer.marketResearch.pains} />
          </Section>
          <Section title="Principais desejos">
            <List items={offer.marketResearch.desires} />
          </Section>
          <Section title="Palavras mais usadas">
            <div className="flex flex-wrap gap-2">
              {offer.marketResearch.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </Section>
          <Section title="Concorrência">
            <List items={offer.marketResearch.competitors} />
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Preço médio:</span>{" "}
              {offer.marketResearch.averagePrice}
            </p>
          </Section>
          <Section title="Oportunidades">
            <List items={offer.marketResearch.opportunities} />
          </Section>
        </TabsContent>

        <TabsContent value="validador" className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="surface-card flex flex-col items-center justify-center p-8 text-center">
            <p className="font-display text-6xl text-gradient-brand">{offer.score.total}</p>
            <p className="mt-1 text-sm text-muted-foreground">Score da oferta (0–100)</p>
          </div>
          <div className="surface-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">Diagnóstico por critério</h3>
            <div className="space-y-3">
              {(
                [
                  ["Clareza", offer.score.clareza],
                  ["Oferta", offer.score.oferta],
                  ["Preço", offer.score.preco],
                  ["Promessa", offer.score.promessa],
                  ["Urgência", offer.score.urgencia],
                  ["Copy", offer.score.copy],
                ] as const
              ).map(([label, val]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                  <Progress value={val} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card p-5 lg:col-span-3">
            <h3 className="mb-3 text-sm font-semibold">Sugestões da IA</h3>
            <List items={offer.score.suggestions} />
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

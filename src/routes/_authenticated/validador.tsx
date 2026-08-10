import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Gauge, Loader2, ShieldCheck, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { validateOfferWithAi } from "@/lib/offers.functions";
import type { OfferValidation } from "@/lib/offer-schema";
import { useProjects } from "@/lib/projects-store";

export const Route = createFileRoute("/_authenticated/validador")({
  head: () => ({
    meta: [
      { title: "Validador de Oferta — LowTicket AI" },
      {
        name: "description",
        content:
          "Cole sua oferta e receba um diagnóstico com nota de 0 a 100, pontos fortes, pontos fracos e melhorias imediatas.",
      },
      { property: "og:title", content: "Validador de Oferta — LowTicket AI" },
      {
        property: "og:description",
        content: "Diagnóstico honesto da sua oferta low ticket com nota e plano de correção.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ValidadorPage,
});

function ValidadorPage() {
  const runValidate = useServerFn(validateOfferWithAi);
  const projects = useProjects();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OfferValidation | null>(null);

  const handleValidate = async () => {
    if (description.trim().length < 20 || loading) return;
    setLoading(true);
    try {
      const validation = await runValidate({ data: { description: description.trim() } });
      setResult(validation);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao validar a oferta.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const { offer, brief } = project;
    setDescription(
      `Produto: ${offer.productName}\nPúblico: ${brief.publico}\nPreço: ${brief.preco}\nPromessa: ${offer.bigPromise}\nHeadline: ${offer.headline}\nOferta: ${offer.bullets.join(
        "; ",
      )}\nGarantia: ${offer.guarantee.title} — ${offer.guarantee.description}\nUrgência: ${offer.urgency}`,
    );
  };

  return (
    <AppShell
      title="Validador de Oferta"
      description="Diagnóstico honesto com nota, pontos fracos e correções"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card space-y-3 p-5">
          <Label htmlFor="validador-input" className="text-sm font-semibold">
            Descreva sua oferta
          </Label>
          <p className="text-xs text-muted-foreground">
            Inclua produto, público, preço, promessa, bônus e garantia. Quanto mais detalhe, melhor
            o diagnóstico.
          </p>
          <Textarea
            id="validador-input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={14}
            placeholder="Ex: Curso de 7 dias que ensina donos de petshop a lotarem a agenda com Instagram, por R$ 47..."
          />
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">Usar uma oferta existente:</span>
              {projects.slice(0, 6).map((project) => (
                <Button
                  key={project.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => loadFromProject(project.id)}
                >
                  {project.offer.productName}
                </Button>
              ))}
            </div>
          )}
          <Button
            onClick={() => void handleValidate()}
            disabled={loading || description.trim().length < 20}
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-4" aria-hidden="true" />
            )}
            Validar oferta
          </Button>
          <p aria-live="polite" className="sr-only">
            {loading ? "Validando oferta..." : ""}
          </p>
        </div>

        <div className="space-y-4">
          {!result ? (
            <div className="surface-card flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
              <Gauge className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">
                O diagnóstico completo aparece aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="surface-card p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Nota geral</span>
                  <span className="font-display text-3xl">{result.total}/100</span>
                </div>
                <Progress value={result.total} className="mt-2 h-2" />
                <p className="mt-3 text-sm">{result.verdict}</p>
              </div>

              <div className="surface-card space-y-3 p-5">
                {result.criteria.map((criterion) => (
                  <div key={criterion.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{criterion.name}</span>
                      <span className="text-muted-foreground">{criterion.score}/100</span>
                    </div>
                    <Progress value={criterion.score} className="mt-1 h-1.5" />
                    <p className="mt-1 text-xs text-muted-foreground">{criterion.analysis}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-card p-5">
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                    <ThumbsUp className="size-4" aria-hidden="true" /> Pontos fortes
                  </h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {result.strengths.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="surface-card p-5">
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                    <ThumbsDown className="size-4" aria-hidden="true" /> Pontos fracos
                  </h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {result.weaknesses.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="surface-card p-5">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Zap className="size-4" aria-hidden="true" /> Correções rápidas
                </h2>
                <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {result.quickWins.map((item, index) => (
                    <li key={item}>
                      {index + 1}. {item}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                  <p>
                    <span className="font-medium">Promessa reescrita: </span>
                    {result.rewrittenPromise}
                  </p>
                  <p>
                    <span className="font-medium">Headline reescrita: </span>
                    {result.rewrittenHeadline}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

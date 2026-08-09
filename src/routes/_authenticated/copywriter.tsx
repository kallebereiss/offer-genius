import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, PenLine, Copy as CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateCopy } from "@/lib/offers.functions";
import { useProjects } from "@/lib/projects-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/copywriter")({
  head: () => ({
    meta: [
      { title: "IA Copywriter — LowTicket AI" },
      {
        name: "description",
        content:
          "Gere headlines, promessas, CTAs, bônus, garantias e scripts de anúncios em segundos com o agente copywriter da LowTicket AI.",
      },
      { property: "og:title", content: "IA Copywriter — LowTicket AI" },
      {
        property: "og:description",
        content: "Headlines, promessas, CTAs e scripts gerados por IA.",
      },
    ],
  }),
  component: CopywriterPage,
});

const TASKS = [
  {
    label: "100 headlines",
    task: "Gere 100 headlines de alta conversão, agrupadas por estilo (curiosidade, prova, dor, urgência, autoridade).",
  },
  { label: "Promessas", task: "Gere 30 promessas irresistíveis, específicas e mensuráveis." },
  {
    label: "Nomes",
    task: "Gere 60 nomes de produto agrupados em Premium, Urgente, Emocional, Curto, Autoridade, Luxo, Exclusivo, Tecnologia e IA.",
  },
  { label: "CTAs", task: "Gere 30 CTAs de botão e de encerramento de página." },
  {
    label: "Garantias",
    task: "Gere garantias de 7, 15 e 30 dias, condicional, total e blindada, com texto pronto.",
  },
  {
    label: "Bônus",
    task: "Gere 8 bônus com nome, descrição, valor percebido e o aumento estimado do valor total da oferta.",
  },
  {
    label: "Anúncios Meta",
    task: "Gere 8 anúncios para Meta Ads com hook, corpo, CTA e sugestão de criativo.",
  },
  {
    label: "Scripts Reels",
    task: "Gere 6 roteiros de Reels de 30 segundos com gancho, desenvolvimento e chamada.",
  },
];

function CopywriterPage() {
  const projects = useProjects();
  const runCopy = useServerFn(generateCopy);
  const [context, setContext] = useState("");
  const [task, setTask] = useState(TASKS[0]!.task);
  const [activeLabel, setActiveLabel] = useState(TASKS[0]!.label);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!context.trim()) {
      toast.error("Descreva o contexto da sua oferta primeiro.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const result = await runCopy({ data: { task, context } });
      setOutput(result.text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar copy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="IA Copywriter" description="Agente de copy de resposta direta">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">1. Escolha o que gerar</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {TASKS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setTask(item.task);
                  setActiveLabel(item.label);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-all",
                  activeLabel === item.label
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/40",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold">2. Contexto da oferta</h2>
          {projects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {projects.slice(0, 4).map((p) => (
                <Badge
                  key={p.id}
                  variant="outline"
                  className="cursor-pointer hover:border-primary"
                  onClick={() =>
                    setContext(
                      `${p.offer.productName} — ${p.offer.bigPromise}. Público: ${p.brief.publico}. Problema: ${p.brief.problema}. Desejo: ${p.brief.desejo}. Preço: ${p.brief.preco}.`,
                    )
                  }
                >
                  usar {p.offer.productName}
                </Badge>
              ))}
            </div>
          )}
          <Textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            rows={7}
            placeholder="Ex: Checklist de emagrecimento para mães ocupadas, R$ 27, promessa de perder 5kg em 30 dias sem dieta restritiva."
            className="mt-3 resize-none"
          />

          <Button onClick={handleRun} disabled={loading} className="mt-4 w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Escrevendo...
              </>
            ) : (
              <>
                <PenLine className="size-4" /> Gerar copy
              </>
            )}
          </Button>
        </div>

        <div className="surface-card flex min-h-[420px] flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Resultado</h2>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copiado");
                }}
              >
                <CopyIcon className="size-4" /> Copiar
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> O agente copywriter está
              trabalhando...
            </div>
          ) : output ? (
            <pre className="flex-1 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
              {output}
            </pre>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Escolha um tipo de copy, descreva sua oferta e a IA entrega o material pronto para
              publicar.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

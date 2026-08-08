import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FORMATOS, NICHOS, OBJETIVOS, type Brief } from "@/lib/offer-schema";
import {
  generateOfferAssets,
  generateOfferCore,
  generateOfferResearch,
} from "@/lib/offers.functions";
import { createProject } from "@/lib/projects-store";

type NovaOfertaSearch = {
  nicho?: string | undefined;
  formato?: string | undefined;
  preco?: string | undefined;
  desejo?: string | undefined;
};

export const Route = createFileRoute("/_authenticated/nova-oferta")({
  validateSearch: (search: Record<string, unknown>): NovaOfertaSearch => ({
    nicho: typeof search["nicho"] === "string" ? search["nicho"] : undefined,
    formato: typeof search["formato"] === "string" ? search["formato"] : undefined,
    preco: typeof search["preco"] === "string" ? search["preco"] : undefined,
    desejo: typeof search["desejo"] === "string" ? search["desejo"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nova Oferta com IA — LowTicket AI" },
      {
        name: "description",
        content:
          "Wizard de 8 passos que transforma sua ideia em uma oferta low ticket completa: produto, copy, página de vendas, funil e criativos.",
      },
      { property: "og:title", content: "Nova Oferta com IA — LowTicket AI" },
      {
        property: "og:description",
        content: "Crie uma oferta digital completa em 8 passos guiados por IA.",
      },
    ],
  }),
  component: NovaOfertaPage,
});

const PRECOS = ["R$ 9", "R$ 19", "R$ 27", "R$ 37", "R$ 47", "R$ 67", "R$ 97"];

type Step = {
  key: keyof Brief;
  title: string;
  description: string;
  options?: readonly string[];
  placeholder?: string;
  long?: boolean;
};

const STEPS: Step[] = [
  {
    key: "nicho",
    title: "Qual é o nicho?",
    description: "O grande mercado onde a sua oferta vai atuar.",
    options: NICHOS,
  },
  {
    key: "subnicho",
    title: "Qual o subnicho?",
    description: "Quanto mais específico, maior a conversão.",
    placeholder: "Ex: emagrecimento para mães de primeira viagem",
  },
  {
    key: "publico",
    title: "Quem é o público?",
    description: "Descreva a pessoa que vai comprar.",
    placeholder: "Ex: mulheres de 28 a 40 anos, CLT, pouco tempo livre",
    long: true,
  },
  {
    key: "problema",
    title: "Qual o principal problema?",
    description: "A dor mais urgente que tira o sono desse público.",
    placeholder: "Ex: tenta emagrecer há anos e sempre desiste na segunda semana",
    long: true,
  },
  {
    key: "desejo",
    title: "Qual o principal desejo?",
    description: "O resultado que essa pessoa sonha em alcançar.",
    placeholder: "Ex: perder 5kg em 30 dias sem dieta restritiva",
    long: true,
  },
  {
    key: "formato",
    title: "Formato do produto",
    description: "Como a entrega será feita.",
    options: FORMATOS,
  },
  {
    key: "preco",
    title: "Preço desejado",
    description: "Faixa low ticket recomendada entre R$ 9 e R$ 97.",
    options: PRECOS,
  },
  {
    key: "objetivo",
    title: "Objetivo da oferta",
    description: "O papel dessa oferta dentro do seu funil.",
    options: OBJETIVOS,
  },
];

const EMPTY: Brief = {
  nicho: "",
  subnicho: "",
  publico: "",
  problema: "",
  desejo: "",
  formato: "",
  preco: "",
  objetivo: "",
};

function NovaOfertaPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const runCore = useServerFn(generateOfferCore);
  const runAssets = useServerFn(generateOfferAssets);
  const runResearch = useServerFn(generateOfferResearch);
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<Brief>(() => ({
    ...EMPTY,
    nicho: search.nicho ?? "",
    formato: search.formato ?? "",
    preco: search.preco ?? "",
    desejo: search.desejo ?? "",
  }));
  const [loading, setLoading] = useState(false);

  const current = STEPS[step]!;
  const value = brief[current.key];
  const canAdvance = value.trim().length > 0;
  const isLast = step === STEPS.length - 1;

  const setValue = (next: string) => setBrief((prev) => ({ ...prev, [current.key]: next }));

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const [core, assets, research] = await Promise.all([
        runCore({ data: brief }),
        runAssets({ data: brief }),
        runResearch({ data: brief }),
      ]);
      const offer = { ...core, ...assets, ...research };
      const project = await createProject(brief, offer);
      toast.success("Oferta gerada com sucesso!");
      navigate({ to: "/ofertas/$id", params: { id: project.id } });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível gerar a oferta agora.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Nova Oferta" description="8 passos até uma oferta pronta para vender">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {step + 1}/{STEPS.length}
          </span>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <Badge variant="secondary" className="mb-4">
            Passo {step + 1}
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl">{current.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{current.description}</p>

          <div className="mt-6">
            {current.options ? (
              <div className="flex flex-wrap gap-2">
                {current.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue(option)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                      value === option
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : current.long ? (
              <Textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={current.placeholder}
                rows={4}
                className="resize-none text-base"
              />
            ) : (
              <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={current.placeholder}
                className="h-12 text-base"
              />
            )}

            {current.options && (
              <Input
                value={current.options.includes(value) ? "" : value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ou escreva a sua própria opção"
                className="mt-4"
              />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
              className="gap-1.5"
            >
              <ArrowLeft className="size-4" /> Voltar
            </Button>
            {isLast ? (
              <Button
                onClick={handleGenerate}
                disabled={!canAdvance || loading}
                size="lg"
                className="gap-2 shadow-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Gerando oferta...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Gerar oferta completa
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="gap-1.5"
              >
                Continuar <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Os agentes de pesquisa, copy, produto, branding, oferta, funil e criativos estão
            trabalhando. Isso leva de 30 a 60 segundos.
          </p>
        )}
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Coins, Gauge, Lightbulb, Package, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHydrated, useProjects } from "@/lib/projects-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — LowTicket AI" },
      {
        name: "description",
        content:
          "Painel da LowTicket AI: acompanhe suas ofertas low ticket, score de conversão e insights gerados por inteligência artificial.",
      },
      { property: "og:title", content: "Dashboard — LowTicket AI" },
      {
        property: "og:description",
        content: "Crie ofertas digitais de alta conversão em minutos com IA.",
      },
    ],
  }),
  component: DashboardPage,
});

const CHART_DATA = [
  { mes: "Jan", ofertas: 2, score: 61 },
  { mes: "Fev", ofertas: 4, score: 66 },
  { mes: "Mar", ofertas: 3, score: 71 },
  { mes: "Abr", ofertas: 6, score: 74 },
  { mes: "Mai", ofertas: 8, score: 79 },
  { mes: "Jun", ofertas: 11, score: 84 },
];

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="surface-card group p-5 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
    </div>
  );
}

function DashboardPage() {
  const projects = useProjects();
  const hydrated = useHydrated();
  const active = projects.filter((p) => !p.archived);

  const avgScore = active.length
    ? Math.round(active.reduce((sum, p) => sum + (p.offer.score?.total ?? 0), 0) / active.length)
    : 0;

  const estimatedRevenue = active.reduce((sum, p) => {
    const price = Number((p.brief.preco || "").replace(/[^\d,.]/g, "").replace(",", ".")) || 27;
    return sum + price * 120;
  }, 0);

  const insights = active.slice(0, 3).flatMap((p) =>
    (p.offer.score?.suggestions ?? []).slice(0, 1).map((s) => ({
      id: `${p.id}-${s}`,
      offer: p.offer.productName,
      text: s,
    })),
  );

  return (
    <AppShell
      title="Dashboard"
      description="Visão geral das suas ofertas e da inteligência do seu negócio"
    >
      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: "var(--gradient-subtle)" }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Sparkles className="size-3" /> Motor de IA ativo
            </Badge>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Transforme uma ideia em uma{" "}
              <span className="text-gradient-brand">oferta pronta para vender</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Responda 8 perguntas e a IA gera produto, copy, página de vendas, funil, bônus,
              garantia, criativos e plano de lançamento.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2 shadow-glow">
            <Link to="/nova-oferta">
              <Sparkles className="size-4" />
              Criar oferta com IA
            </Link>
          </Button>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Ofertas criadas"
          value={hydrated ? String(active.length) : "—"}
          hint="Projetos ativos na sua conta"
        />
        <StatCard
          icon={Coins}
          label="Receita estimada"
          value={hydrated ? `R$ ${estimatedRevenue.toLocaleString("pt-BR")}` : "—"}
          hint="Projeção com 120 vendas por oferta"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversão média"
          value={hydrated && active.length ? `${(2.4 + avgScore / 100).toFixed(1)}%` : "—"}
          hint="Estimativa baseada no score"
        />
        <StatCard
          icon={Gauge}
          label="Score médio"
          value={hydrated && active.length ? `${avgScore}/100` : "—"}
          hint="Qualidade das suas ofertas"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Evolução das ofertas</h3>
              <p className="text-xs text-muted-foreground">Volume criado e score médio</p>
            </div>
            <Badge variant="outline">Últimos 6 meses</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillOfertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-chart-2)"
                  fill="url(#fillScore)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="ofertas"
                  stroke="var(--color-chart-1)"
                  fill="url(#fillOfertas)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Insights da IA</h3>
          </div>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Crie sua primeira oferta para receber sugestões automáticas de melhoria, preço, CTA e
              novos bônus.
            </p>
          ) : (
            <ul className="space-y-3">
              {insights.map((insight) => (
                <li key={insight.id} className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs font-medium text-primary">{insight.offer}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="surface-card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Últimas ofertas</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/ofertas">Ver todas</Link>
          </Button>
        </div>
        {!hydrated || active.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm font-medium">Nenhuma oferta ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sua primeira oferta completa fica pronta em menos de 2 minutos.
            </p>
            <Button asChild className="mt-4 gap-2">
              <Link to="/nova-oferta">
                <Sparkles className="size-4" /> Começar agora
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {active.slice(0, 5).map((project) => (
              <li key={project.id}>
                <Link
                  to="/ofertas/$id"
                  params={{ id: project.id }}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{project.offer.productName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {project.brief.nicho} · {project.brief.formato} · {project.brief.preco}
                    </p>
                  </div>
                  <div className="hidden w-32 sm:block">
                    <Progress value={project.offer.score?.total ?? 0} className="h-1.5" />
                  </div>
                  <Badge variant="secondary">{project.offer.score?.total ?? 0}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

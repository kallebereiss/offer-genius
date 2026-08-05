import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjects, useTheme } from "@/lib/projects-store";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — LowTicket AI" },
      {
        name: "description",
        content:
          "Ajuste tema, idioma, preferências de geração e acompanhe seu progresso de gamificação na LowTicket AI.",
      },
      { property: "og:title", content: "Configurações — LowTicket AI" },
      {
        property: "og:description",
        content: "Tema, idioma, integrações e preferências da sua conta.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { theme, toggle } = useTheme();
  const projects = useProjects();
  const xp = projects.length * 120;
  const level = Math.floor(xp / 500) + 1;
  const progress = ((xp % 500) / 500) * 100;

  const badges = [
    { name: "Primeira oferta", unlocked: projects.length >= 1 },
    { name: "Criador em série", unlocked: projects.length >= 3 },
    { name: "Estrategista", unlocked: projects.length >= 5 },
    { name: "Score 80+", unlocked: projects.some((p) => (p.offer.score?.total ?? 0) >= 80) },
  ];

  return (
    <AppShell title="Configurações" description="Preferências, conta e progresso">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Aparência</h2>
          <div className="mt-4 flex items-center justify-between">
            <Label htmlFor="tema">Modo escuro</Label>
            <Switch id="tema" checked={theme === "dark"} onCheckedChange={toggle} />
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Perfil</h2>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Seu nome" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="idioma">Idioma</Label>
              <Input id="idioma" defaultValue="Português (Brasil)" className="mt-1.5" />
            </div>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Integrações</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A geração de conteúdo já usa a IA integrada da plataforma — não é necessário configurar
            nenhuma chave. Integrações de pagamento, e-mail e automações entram nas próximas
            versões.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["IA integrada", "Pagamentos", "E-mail", "Webhooks"].map((item, index) => (
              <Badge key={item} variant={index === 0 ? "secondary" : "outline"}>
                {item}
                {index === 0 ? " · ativa" : " · em breve"}
              </Badge>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Progresso</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nível {level}</span>
            <span className="font-medium">{xp} XP</span>
          </div>
          <Progress value={progress} className="mt-2 h-1.5" />
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge.name} variant={badge.unlocked ? "default" : "outline"}>
                {badge.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

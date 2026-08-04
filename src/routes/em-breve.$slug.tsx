import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/em-breve/$slug")({
  head: () => ({
    meta: [
      { title: "Módulo em construção — LowTicket AI" },
      {
        name: "description",
        content:
          "Este módulo da LowTicket AI está em construção. Enquanto isso, gere ofertas completas com copy, funil e criativos no wizard de IA.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Módulo em construção — LowTicket AI" },
      {
        property: "og:description",
        content: "Novo módulo chegando em breve na LowTicket AI.",
      },
    ],
  }),
  component: EmBrevePage,
});

const TITLES: Record<string, { title: string; description: string }> = {
  "criador-de-produto": { title: "Criador de Produto", description: "Gera ebook, checklist, planilha, mini curso, template e framework completos." },
  "landing-pages": { title: "Landing Pages", description: "Editor visual drag and drop com histórico de versões e publicação." },
  criativos: { title: "Criativos", description: "Imagens, carrosséis, stories, reels, thumbs e banners gerados por IA." },
  funis: { title: "Funis", description: "Construtor visual de funis com upsell, downsell e order bump." },
  bonus: { title: "Bônus", description: "Gerador de bônus com cálculo de aumento de valor percebido." },
  garantias: { title: "Garantias", description: "Biblioteca de garantias condicionais, totais e blindadas." },
  avatar: { title: "Avatar", description: "Mapa completo do cliente ideal com dores, desejos e objeções." },
  "pesquisa-de-mercado": { title: "Pesquisa de Mercado", description: "Tendências, palavras-chave, dores e oportunidades por nicho." },
  "analise-da-concorrencia": { title: "Análise da Concorrência", description: "Preço médio, promessas, pontos fortes e como superar." },
  validador: { title: "Validador", description: "Score independente de 0 a 100 para qualquer oferta." },
  biblioteca: { title: "Biblioteca", description: "Todos os seus materiais organizados e reutilizáveis." },
  historico: { title: "Histórico", description: "Cada geração salva, comparável e restaurável." },
  perfil: { title: "Perfil", description: "Sua conta, plano e preferências de criação." },
};

function EmBrevePage() {
  const { slug } = useParams({ from: "/em-breve/$slug" });
  const info = TITLES[slug] ?? { title: "Módulo", description: "Em construção." };

  return (
    <AppShell title={info.title} description="Módulo em construção">
      <div className="surface-card mx-auto max-w-2xl p-10 text-center">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Sparkles className="size-3" /> Em breve
        </Badge>
        <h2 className="font-display text-3xl">{info.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{info.description}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Enquanto isso, o wizard já entrega esse conteúdo dentro de cada oferta gerada.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link to="/nova-oferta">
            <Sparkles className="size-4" /> Gerar oferta completa
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({
    meta: [
      { title: "Templates de Oferta — LowTicket AI" },
      {
        name: "description",
        content:
          "Modelos de ofertas low ticket validadas por nicho: fitness, finanças, marketing, idiomas, pets e mais. Duplique e gere com IA.",
      },
      { property: "og:title", content: "Templates de Oferta — LowTicket AI" },
      {
        property: "og:description",
        content: "Modelos de oferta prontos por nicho para duplicar e adaptar.",
      },
    ],
  }),
  component: TemplatesPage,
});

const TEMPLATES = [
  {
    nicho: "Fitness",
    nome: "Desafio 21 Dias",
    formato: "Desafio",
    preco: "R$ 27",
    promessa: "Criar consistência de treino em 21 dias sem academia.",
  },
  {
    nicho: "Finanças",
    nome: "Planilha Sai do Vermelho",
    formato: "Planilha",
    preco: "R$ 19",
    promessa: "Organizar as contas e sobrar dinheiro no fim do mês.",
  },
  {
    nicho: "Marketing",
    nome: "Pack 300 Prompts",
    formato: "Pack de Prompts",
    preco: "R$ 37",
    promessa: "Produzir 30 dias de conteúdo em uma tarde.",
  },
  {
    nicho: "Idiomas",
    nome: "Inglês em 15 Minutos",
    formato: "Mini Curso",
    preco: "R$ 47",
    promessa: "Falar frases úteis já na primeira semana.",
  },
  {
    nicho: "Pets",
    nome: "Guia do Filhote",
    formato: "Ebook",
    preco: "R$ 19",
    promessa: "Educar o filhote sem estresse nos primeiros 60 dias.",
  },
  {
    nicho: "Estética",
    nome: "Skincare Essencial",
    formato: "Checklist",
    preco: "R$ 17",
    promessa: "Rotina de pele em 5 passos com produtos de farmácia.",
  },
  {
    nicho: "Maternidade",
    nome: "Sono do Bebê",
    formato: "Kit",
    preco: "R$ 47",
    promessa: "Noites completas de sono em até 3 semanas.",
  },
  {
    nicho: "Programação",
    nome: "Portfólio em 7 Dias",
    formato: "Workshop",
    preco: "R$ 67",
    promessa: "Publicar 3 projetos reais e aplicar para vagas.",
  },
  {
    nicho: "Culinária",
    nome: "Marmitas Fit",
    formato: "Pacote",
    preco: "R$ 27",
    promessa: "Semana inteira de refeições em 2 horas de preparo.",
  },
];

function TemplatesPage() {
  return (
    <AppShell title="Templates" description="Modelos validados por nicho para acelerar sua criação">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template) => (
          <article
            key={template.nome}
            className="surface-card flex flex-col p-5 hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <Badge variant="outline" className="w-fit">
              {template.nicho}
            </Badge>
            <h2 className="mt-3 text-base font-semibold">{template.nome}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{template.promessa}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {template.formato} · {template.preco}
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-4 gap-1.5">
              <Link
                to="/nova-oferta"
                search={{
                  nicho: template.nicho,
                  formato: template.formato,
                  preco: template.preco,
                  desejo: template.promessa,
                }}
              >
                Usar este modelo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

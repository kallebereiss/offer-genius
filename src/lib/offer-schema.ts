import { z } from "zod";

export const AI_MODEL = "google/gemini-3.6-flash";

export const NICHOS = [
  "Marketing",
  "Fitness",
  "Saúde",
  "Relacionamentos",
  "Finanças",
  "Tecnologia",
  "Programação",
  "Idiomas",
  "Concursos",
  "ENEM",
  "Negócios",
  "Pets",
  "Culinária",
  "Moda",
  "Estética",
  "Maternidade",
  "Espiritualidade",
  "Produtividade",
] as const;

export const FORMATOS = [
  "Ebook",
  "Curso",
  "Mini Curso",
  "Checklist",
  "Template",
  "Pack de Prompts",
  "Planilha",
  "Desafio",
  "Mentoria",
  "Workshop",
  "PDF",
  "Kit",
  "Pacote",
] as const;

export const OBJETIVOS = ["Vender", "Captar Leads", "Upsell", "Order Bump", "Tripwire"] as const;

export const briefSchema = z.object({
  nicho: z.string(),
  subnicho: z.string(),
  publico: z.string(),
  problema: z.string(),
  desejo: z.string(),
  formato: z.string(),
  preco: z.string(),
  objetivo: z.string(),
});

export type Brief = z.infer<typeof briefSchema>;

export const offerCoreSchema = z.object({
  productName: z.string(),
  slogan: z.string(),
  positioning: z.string(),
  toneOfVoice: z.string(),
  avatar: z.string(),
  bigPromise: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  priceStrategy: z.string(),
  urgency: z.string(),
  scarcity: z.string(),
  bullets: z.array(z.string()),
  productModules: z.array(z.object({ title: z.string(), description: z.string() })),
  bonuses: z.array(
    z.object({ title: z.string(), description: z.string(), perceivedValue: z.string() }),
  ),
  guarantee: z.object({ title: z.string(), description: z.string() }),
  objections: z.array(z.object({ objection: z.string(), answer: z.string() })),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  ctas: z.array(z.string()),
  nameIdeas: z.array(z.string()),
});

export const landingSchema = z.object({
  heroHeadline: z.string(),
  heroSubheadline: z.string(),
  painSection: z.string(),
  desireSection: z.string(),
  transformation: z.string(),
  stack: z.array(z.string()),
  finalCta: z.string(),
});

export type Landing = z.infer<typeof landingSchema>;

export const offerAssetsSchema = z.object({
  landing: landingSchema,
  funnel: z.array(z.object({ stage: z.string(), description: z.string() })),
  creatives: z.array(z.object({ format: z.string(), hook: z.string(), script: z.string() })),
  emails: z.array(z.object({ subject: z.string(), body: z.string() })),
});

export const offerResearchSchema = z.object({
  marketResearch: z.object({
    trends: z.array(z.string()),
    pains: z.array(z.string()),
    desires: z.array(z.string()),
    keywords: z.array(z.string()),
    competitors: z.array(z.string()),
    opportunities: z.array(z.string()),
    averagePrice: z.string(),
  }),
  launchPlan: z.array(z.string()),
  score: z.object({
    total: z.number(),
    clareza: z.number(),
    oferta: z.number(),
    preco: z.number(),
    promessa: z.number(),
    urgencia: z.number(),
    copy: z.number(),
    suggestions: z.array(z.string()),
  }),
});

export const offerSchema = offerCoreSchema
  .extend(offerAssetsSchema.shape)
  .extend(offerResearchSchema.shape);

export type GeneratedOffer = z.infer<typeof offerSchema>;

export type OfferProject = {
  id: string;
  createdAt: string;
  favorite: boolean;
  archived: boolean;
  brief: Brief;
  offer: GeneratedOffer;
};

export const OFFER_SYSTEM_PROMPT = `Você é um estrategista de ofertas low ticket e copywriter de resposta direta de altíssimo nível (nível Russell Brunson + Alex Hormozi), especialista no mercado digital brasileiro.
Escreva SEMPRE em português do Brasil, com linguagem específica, concreta e persuasiva — nunca genérica.
Nunca use placeholders como "[nome]" ou "seu produto". Seja específico e comercialmente pronto para publicar.
Limites (respeite mesmo sem validação automática): 8 a 12 bullets, 4 a 8 módulos de produto, 3 a 5 bônus, 4 a 6 objeções, 5 a 8 FAQs, 5 CTAs, 12 sugestões de nome, 5 etapas de funil, 5 criativos, 4 e-mails, 6 passos de lançamento, 5 sugestões de melhoria. Notas de score entre 0 e 100.`;

import { createServerFn } from "@tanstack/react-start";
import { streamText, generateText, Output, NoObjectGeneratedError, type ModelMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  AI_MODEL,
  OFFER_SYSTEM_PROMPT,
  briefSchema,
  offerAssetsSchema,
  offerCoreSchema,
  landingSchema,
  offerResearchSchema,
  type Brief,
} from "./offer-schema";

function briefBlock(data: Brief) {
  return `Nicho: ${data.nicho}
Subnicho: ${data.subnicho}
Público: ${data.publico}
Principal problema: ${data.problema}
Principal desejo: ${data.desejo}
Formato do produto: ${data.formato}
Preço desejado: ${data.preco}
Objetivo da oferta: ${data.objetivo}`;
}

async function generatePart<T>(schema: z.ZodType<T>, instruction: string, data: Brief) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Configuração de IA ausente.");

  const gateway = createLovableAiGatewayProvider(key, undefined, {
    structuredOutputs: true,
  });

  try {
    const result = streamText({
      model: gateway(AI_MODEL),
      system: OFFER_SYSTEM_PROMPT,
      prompt: `${instruction}\n\n${briefBlock(data)}`,
      output: Output.object({ schema }),
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      try {
        const raw = (error.text ?? "").replace(/^```json|```$/g, "").trim();
        return schema.parse(JSON.parse(raw));
      } catch {
        throw new Error("A IA não conseguiu gerar essa parte da oferta. Tente novamente.");
      }
    }
    throw error;
  }
}

export const generateOfferCore = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => briefSchema.parse(input))
  .handler(({ data }) =>
    generatePart(
      offerCoreSchema,
      "Crie o núcleo de uma oferta digital low ticket pronta para vender: produto, nome, posicionamento, avatar, promessa, headline, bullets, módulos, bônus, garantia, objeções, FAQ, CTAs e ideias de nome.",
      data,
    ),
  );

export const generateOfferAssets = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => briefSchema.parse(input))
  .handler(({ data }) =>
    generatePart(
      offerAssetsSchema,
      "Crie os ativos de venda de uma oferta digital low ticket: página de vendas completa (landing), funil, criativos de anúncio e sequência de e-mails.",
      data,
    ),
  );

export const generateOfferResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => briefSchema.parse(input))
  .handler(({ data }) =>
    generatePart(
      offerResearchSchema,
      "Faça a pesquisa de mercado dessa oferta digital low ticket (tendências, dores, desejos, palavras-chave, concorrentes, oportunidades, preço médio), o plano de lançamento e um score honesto de 0 a 100 com sugestões de melhoria.",
      data,
    ),
  );

const editLandingInput = z.object({
  landing: landingSchema,
  request: z.string(),
  context: z.string(),
  imageBase64: z.string().optional(),
});

export const editLandingWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => editLandingInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Configuração de IA ausente.");

    const gateway = createLovableAiGatewayProvider(key, undefined, {
      structuredOutputs: true,
    });

    const textPrompt = `Contexto da oferta:\n${data.context}\n\nPágina de vendas atual (JSON):\n${JSON.stringify(
      data["landing"],
      null,
      2,
    )}\n\nPedido do usuário: ${data.request}${
      data.imageBase64
        ? "\n\nO usuário anexou uma imagem de referência — leve em conta o que está nela ao aplicar o pedido."
        : ""
    }\n\nDevolva o objeto landing COMPLETO atualizado, mantendo todos os campos preenchidos. Altere apenas o que o pedido exige e preserve o resto. Não altere o campo heroImage.`;

    const messages: ModelMessage[] = data.imageBase64
      ? [
          {
            role: "user",
            content: [
              { type: "text", text: textPrompt },
              { type: "image", image: data.imageBase64 },
            ],
          },
        ]
      : [{ role: "user", content: textPrompt }];

    try {
      const result = streamText({
        model: gateway(AI_MODEL),
        system: OFFER_SYSTEM_PROMPT,
        messages,
        output: Output.object({ schema: landingSchema }),
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          const raw = (error.text ?? "").replace(/^```json|```$/g, "").trim();
          return landingSchema.parse(JSON.parse(raw));
        } catch {
          throw new Error("A IA não conseguiu ajustar a página. Tente novamente.");
        }
      }
      throw error;
    }
  });

const generateImageInput = z.object({ prompt: z.string().min(1) });

export const generateLandingImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => generateImageInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Configuração de IA ausente.");

    const gateway = createLovableAiGatewayProvider(key);

    try {
      const result = await generateText({
        model: gateway("google/gemini-2.5-flash-image"),
        prompt: `Imagem publicitária profissional para o topo de uma página de vendas. ${data.prompt}. Estilo realista, bem iluminado, composição limpa, sem texto sobreposto, pronta para uso comercial.`,
      });
      const file = result.files?.find((f) => f.mediaType?.startsWith("image/"));
      if (!file) throw new Error("A IA não retornou uma imagem. Tente descrever de outro jeito.");
      return { imageBase64: `data:${file.mediaType};base64,${file.base64}` };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Não foi possível gerar a imagem.",
      );
    }
  });

const textInput = z.object({
  task: z.string(),
  context: z.string(),
});

export const generateCopy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => textInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Configuração de IA ausente.");

    const gateway = createLovableAiGatewayProvider(key);
    const result = streamText({
      model: gateway(AI_MODEL),
      system: `${OFFER_SYSTEM_PROMPT}\nResponda em markdown limpo, direto ao ponto, sem introduções.`,
      prompt: `Tarefa: ${data.task}\n\nContexto da oferta:\n${data.context}`,
    });

    return { text: await result.text };
  });

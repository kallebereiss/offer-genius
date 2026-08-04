import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  AI_MODEL,
  OFFER_SYSTEM_PROMPT,
  briefSchema,
  offerSchema,
} from "./offer-schema";

export const generateOffer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => briefSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Configuração de IA ausente.");

    const gateway = createLovableAiGatewayProvider(key, undefined, {
      structuredOutputs: true,
    });

    const prompt = `Crie uma oferta digital low ticket completa e pronta para vender.

Nicho: ${data.nicho}
Subnicho: ${data.subnicho}
Público: ${data.publico}
Principal problema: ${data.problema}
Principal desejo: ${data.desejo}
Formato do produto: ${data.formato}
Preço desejado: ${data.preco}
Objetivo da oferta: ${data.objetivo}

Entregue produto, nome, posicionamento, promessa, copy completa, página de vendas, bônus, garantia, funil, criativos, e-mails, pesquisa de mercado e um score honesto de 0 a 100 com sugestões de melhoria.`;

    try {
      const result = streamText({
        model: gateway(AI_MODEL),
        system: OFFER_SYSTEM_PROMPT,
        prompt,
        output: Output.object({ schema: offerSchema }),
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          const raw = (error.text ?? "").replace(/^```json|```$/g, "").trim();
          return offerSchema.parse(JSON.parse(raw));
        } catch {
          throw new Error("A IA não conseguiu gerar a oferta. Tente novamente.");
        }
      }
      throw error;
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

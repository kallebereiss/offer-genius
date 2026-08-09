import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ImageIcon, Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateOffer, useHydrated, useProject } from "@/lib/projects-store";
import { offerToLandingHtml } from "@/lib/export-landing";
import { editLandingWithAi, generateLandingImage } from "@/lib/offers.functions";
import type { Landing } from "@/lib/offer-schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ofertas/$id_/personalizar")({
  head: () => ({
    meta: [
      { title: "Personalizar página de vendas — LowTicket AI" },
      {
        name: "description",
        content:
          "Edite a página de vendas da sua oferta por formulário ou por IA, com preview ao vivo do HTML final.",
      },
      { property: "og:title", content: "Personalizar página de vendas — LowTicket AI" },
      {
        property: "og:description",
        content: "Edição por formulário + IA com preview ao vivo da landing page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PersonalizarLanding,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string | undefined;
};

type TextFieldKey =
  "heroHeadline" | "heroSubheadline" | "painSection" | "desireSection" | "transformation";

const FIELDS: { key: TextFieldKey; label: string; rows: number }[] = [
  { key: "heroHeadline", label: "Headline principal", rows: 2 },
  { key: "heroSubheadline", label: "Subheadline", rows: 2 },
  { key: "painSection", label: "Seção de dores", rows: 4 },
  { key: "desireSection", label: "Seção de desejos", rows: 4 },
  { key: "transformation", label: "Transformação", rows: 3 },
];

function PersonalizarLanding() {
  const { id } = useParams({ from: "/_authenticated/ofertas/$id_/personalizar" });
  const uid = useId();
  const project = useProject(id);
  const hydrated = useHydrated();
  const runEdit = useServerFn(editLandingWithAi);
  const runGenerateImage = useServerFn(generateLandingImage);

  const [landing, setLanding] = useState<Landing | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function readImageFromClipboard(event: React.ClipboardEvent, onImage: (dataUrl: string) => void) {
    const item = Array.from(event.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return false;
    const file = item.getAsFile();
    if (!file) return false;
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = () => onImage(reader.result as string);
    reader.readAsDataURL(file);
    return true;
  }

  useEffect(() => {
    if (project && !landing) setLanding(project.offer.landing);
  }, [project, landing]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const scheduleSave = (next: Landing) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateOffer(id, { landing: next });
    }, 600);
  };

  const patch = (values: Partial<Landing>) => {
    setLanding((current) => {
      if (!current) return current;
      const next = { ...current, ...values };
      scheduleSave(next);
      return next;
    });
  };

  const previewHtml = useMemo(() => {
    if (!project || !landing) return "";
    return offerToLandingHtml({
      ...project,
      offer: { ...project.offer, landing },
    });
  }, [project, landing]);

  if (!hydrated) return null;

  if (!project || !landing) {
    return (
      <AppShell title="Oferta não encontrada">
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Essa oferta não existe mais.</p>
          <Button asChild className="mt-4">
            <Link to="/ofertas">Voltar para minhas ofertas</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const handleSend = async () => {
    const request = input.trim();
    if (!request || loading) return;
    setInput("");
    const attachedImage = pendingImage;
    setPendingImage(null);
    setMessages((current) => [
      ...current,
      { role: "user", content: request, imageBase64: attachedImage ?? undefined },
    ]);
    setLoading(true);
    try {
      const updated = await runEdit({
        data: {
          landing,
          request,
          context: `${project.offer.productName} — ${project.offer.bigPromise}. Público: ${project.brief.publico}. Preço: ${project.brief.preco}. Tom de voz: ${project.offer.toneOfVoice}.`,
          imageBase64: attachedImage ?? undefined,
        },
      });
      setLanding(updated);
      scheduleSave(updated);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Pronto! Atualizei a página com o seu pedido." },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao editar a página.";
      toast.error(message);
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || generatingImage) return;
    setGeneratingImage(true);
    try {
      const { imageBase64 } = await runGenerateImage({ data: { prompt: imagePrompt.trim() } });
      patch({ heroImage: imageBase64 });
      toast.success("Imagem gerada e aplicada na página.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar a imagem.");
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <AppShell
      title="Personalizar página de vendas"
      description={project.offer.productName}
      actions={
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/ofertas/$id" params={{ id }}>
            <ArrowLeft className="size-4" /> Voltar para a oferta
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="surface-card space-y-4 p-5">
            <div>
              <h2 className="text-sm font-semibold">Conteúdo da página</h2>
              <p className="text-xs text-muted-foreground">
                As alterações são salvas automaticamente.
              </p>
            </div>

            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`${uid}-${field.key}`} className="text-xs">
                  {field.label}
                </Label>
                <Textarea
                  id={`${uid}-${field.key}`}
                  value={landing[field.key]}
                  rows={field.rows}
                  onChange={(event) =>
                    patch({ [field.key]: event.target.value } as Partial<Landing>)
                  }
                  className="resize-none"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <Label htmlFor={`${uid}-stack`} className="text-xs">
                Stack de valor (um item por linha)
              </Label>
              <Textarea
                id={`${uid}-stack`}
                value={landing.stack.join("\n")}
                rows={6}
                onChange={(event) => patch({ stack: event.target.value.split("\n") })}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${uid}-cta`} className="text-xs">
                CTA final
              </Label>
              <Input
                id={`${uid}-cta`}
                value={landing.finalCta}
                onChange={(event) => patch({ finalCta: event.target.value })}
              />
            </div>

            <div
              role="group"
              aria-label="Imagem principal da página. Cole uma imagem com Ctrl+V ou gere com IA."
              tabIndex={0}
              className="space-y-2 rounded-lg border border-dashed p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onPaste={(event) =>
                readImageFromClipboard(event, (dataUrl) => patch({ heroImage: dataUrl }))
              }
            >
              <span className="block text-xs font-medium">
                Imagem principal (cole com Ctrl+V ou gere com IA)
              </span>
              {landing.heroImage ? (
                <div className="relative w-fit">
                  <img
                    src={landing.heroImage}
                    alt="Pré-visualização da imagem principal da página de vendas"
                    className="max-h-32 rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => patch({ heroImage: null })}
                    className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Remover imagem principal"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <p className="flex h-20 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  <ImageIcon className="mr-1.5 size-4" aria-hidden="true" /> Foque esta área e cole
                  (Ctrl+V) uma imagem
                </p>
              )}
              <div className="flex gap-2">
                <Label htmlFor={`${uid}-image-prompt`} className="sr-only">
                  Descrição da imagem para a IA gerar
                </Label>
                <Input
                  id={`${uid}-image-prompt`}
                  value={imagePrompt}
                  onChange={(event) => setImagePrompt(event.target.value)}
                  placeholder="Descreva a imagem que a IA deve gerar..."
                  disabled={generatingImage}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateImage}
                  disabled={generatingImage || !imagePrompt.trim()}
                  className="shrink-0 gap-1.5"
                >
                  {generatingImage ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="size-4" aria-hidden="true" />
                  )}
                  Gerar
                </Button>
              </div>
              <p aria-live="polite" className="sr-only">
                {generatingImage ? "Gerando imagem com IA..." : ""}
              </p>
            </div>
          </div>

          <div className="surface-card flex min-h-[320px] flex-col p-5">
            <h2 id={`${uid}-chat-title`} className="text-sm font-semibold">
              Editar com IA
            </h2>
            <p className="text-xs text-muted-foreground">
              Ex: “deixa o headline mais urgente” ou “reescreve a seção de dores mais emocional”.
            </p>

            <div
              role="log"
              aria-live="polite"
              aria-labelledby={`${uid}-chat-title`}
              className="mt-4 flex-1 space-y-3 overflow-auto"
            >
              {messages.length === 0 ? (
                <p className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="mr-2 size-4" aria-hidden="true" /> Peça qualquer ajuste na
                  página.
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <span className="sr-only">
                      {message.role === "user" ? "Você: " : "Assistente: "}
                    </span>
                    {message.imageBase64 && (
                      <img
                        src={message.imageBase64}
                        alt="Imagem de referência anexada à mensagem"
                        className="mb-1.5 max-h-24 rounded-md"
                      />
                    )}
                    {message.content}
                  </div>
                ))
              )}
              {loading && (
                <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> A IA está
                  reescrevendo a página...
                </p>
              )}
            </div>

            {pendingImage && (
              <div className="relative mt-3 w-fit">
                <img
                  src={pendingImage}
                  alt="Imagem anexada ao próximo pedido"
                  className="max-h-20 rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Remover imagem anexada"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </div>
            )}
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              <Label htmlFor={`${uid}-chat-input`} className="sr-only">
                Descreva a mudança que a IA deve aplicar na página
              </Label>
              <Input
                id={`${uid}-chat-input`}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onPaste={(event) => readImageFromClipboard(event, setPendingImage)}
                placeholder="O que você quer mudar? (cole uma imagem com Ctrl+V se quiser)"
                disabled={loading}
              />
              <Button type="submit" disabled={loading} className="gap-1.5">
                <Send className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Enviar</span>
                <span className="sr-only sm:hidden">Enviar pedido para a IA</span>
              </Button>
            </form>

          </div>
        </div>

        <div className="surface-card overflow-hidden p-0">
          <div className="border-b px-4 py-2 text-xs text-muted-foreground">
            Preview ao vivo — exatamente o HTML exportado
          </div>
          <iframe
            title="Preview da página de vendas"
            srcDoc={previewHtml}
            className="h-[calc(100vh-220px)] min-h-[520px] w-full border-0 bg-white"
          />
        </div>
      </div>
    </AppShell>
  );
}

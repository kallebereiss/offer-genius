import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateOffer, useHydrated, useProject } from "@/lib/projects-store";
import { offerToLandingHtml } from "@/lib/export-landing";
import { editLandingWithAi } from "@/lib/offers.functions";
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

type ChatMessage = { role: "user" | "assistant"; content: string };

const FIELDS: { key: keyof Omit<Landing, "stack">; label: string; rows: number }[] = [
  { key: "heroHeadline", label: "Headline principal", rows: 2 },
  { key: "heroSubheadline", label: "Subheadline", rows: 2 },
  { key: "painSection", label: "Seção de dores", rows: 4 },
  { key: "desireSection", label: "Seção de desejos", rows: 4 },
  { key: "transformation", label: "Transformação", rows: 3 },
];

function PersonalizarLanding() {
  const { id } = useParams({ from: "/_authenticated/ofertas/$id_/personalizar" });
  const project = useProject(id);
  const hydrated = useHydrated();
  const runEdit = useServerFn(editLandingWithAi);

  const [landing, setLanding] = useState<Landing | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setMessages((current) => [...current, { role: "user", content: request }]);
    setLoading(true);
    try {
      const updated = await runEdit({
        data: {
          landing,
          request,
          context: `${project.offer.productName} — ${project.offer.bigPromise}. Público: ${project.brief.publico}. Preço: ${project.brief.preco}. Tom de voz: ${project.offer.toneOfVoice}.`,
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
                <Label className="text-xs">{field.label}</Label>
                <Textarea
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
              <Label className="text-xs">Stack de valor (um item por linha)</Label>
              <Textarea
                value={landing.stack.join("\n")}
                rows={6}
                onChange={(event) => patch({ stack: event.target.value.split("\n") })}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">CTA final</Label>
              <Input
                value={landing.finalCta}
                onChange={(event) => patch({ finalCta: event.target.value })}
              />
            </div>
          </div>

          <div className="surface-card flex min-h-[320px] flex-col p-5">
            <h2 className="text-sm font-semibold">Editar com IA</h2>
            <p className="text-xs text-muted-foreground">
              Ex: “deixa o headline mais urgente” ou “reescreve a seção de dores mais emocional”.
            </p>

            <div className="mt-4 flex-1 space-y-3 overflow-auto">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="mr-2 size-4" /> Peça qualquer ajuste na página.
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> A IA está reescrevendo a página...
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSend();
                }}
                placeholder="O que você quer mudar?"
                disabled={loading}
              />
              <Button onClick={() => void handleSend()} disabled={loading} className="gap-1.5">
                <Send className="size-4" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </div>
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

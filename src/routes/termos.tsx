import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/termos")({
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
          <Zap className="size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">LowTicket AI</span>
      </Link>
      <h1 className="font-display mt-8 text-3xl">Termos de Uso</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">1. Aceitação dos termos</h2>
          <p className="mt-2">
            Ao criar uma conta e usar a LowTicket AI, você concorda com estes Termos de Uso. Se não
            concordar, não utilize a plataforma.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">2. Descrição do serviço</h2>
          <p className="mt-2">
            A LowTicket AI é uma ferramenta que utiliza inteligência artificial para gerar conteúdo
            de ofertas digitais (copy, páginas de venda, funis, criativos e materiais correlatos) a
            partir de informações fornecidas pelo usuário.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">3. Conta do usuário</h2>
          <p className="mt-2">
            Você é responsável por manter a confidencialidade da sua senha e por todas as atividades
            realizadas em sua conta.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">4. Conteúdo gerado por IA</h2>
          <p className="mt-2">
            O conteúdo gerado pela plataforma é produzido por modelos de inteligência artificial e
            pode conter imprecisões. Você é responsável por revisar e validar qualquer material
            antes de publicá-lo ou usá-lo comercialmente.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">5. Uso permitido</h2>
          <p className="mt-2">
            É proibido usar a plataforma para gerar conteúdo ilegal, enganoso, discriminatório ou
            que viole direitos de terceiros.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">6. Propriedade do conteúdo</h2>
          <p className="mt-2">
            O conteúdo gerado a partir das suas informações pertence a você, salvo indicação em
            contrário.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">7. Alterações</h2>
          <p className="mt-2">
            Podemos atualizar estes termos periodicamente. Mudanças relevantes serão comunicadas
            pelos canais da plataforma.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">8. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre estes termos podem ser enviadas para o e-mail de suporte da LowTicket AI.
          </p>
        </section>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
          <Zap className="size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">LowTicket AI</span>
      </Link>
      <h1 className="font-display mt-8 text-3xl">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">1. Dados que coletamos</h2>
          <p className="mt-2">Coletamos nome, e-mail e senha (armazenada de forma criptografada) no cadastro, além dos dados de brief e das ofertas que você gera na plataforma.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">2. Como usamos seus dados</h2>
          <p className="mt-2">Usamos seus dados para autenticação, para gerar o conteúdo solicitado por você via IA, e para manter o histórico das suas ofertas salvo na sua conta.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">3. Armazenamento</h2>
          <p className="mt-2">Seus dados são armazenados em infraestrutura do Supabase, com controle de acesso por conta (cada usuário só acessa os próprios dados).</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">4. Compartilhamento com terceiros</h2>
          <p className="mt-2">Não vendemos seus dados. O texto do seu brief é enviado a provedores de IA (como parte da geração de conteúdo) apenas para processar sua solicitação.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">5. Seus direitos (LGPD)</h2>
          <p className="mt-2">Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail de suporte da LowTicket AI.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">6. Cookies</h2>
          <p className="mt-2">Usamos cookies estritamente necessários para manter sua sessão autenticada.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">7. Contato</h2>
          <p className="mt-2">Dúvidas sobre privacidade podem ser enviadas para o e-mail de suporte da LowTicket AI.</p>
        </section>
      </div>
    </div>
  );
}

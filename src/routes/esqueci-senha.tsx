import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error-message";
import { requestPasswordReset } from "@/lib/auth.functions";

export const Route = createFileRoute("/esqueci-senha")({
  component: EsqueciSenhaPage,
});

function EsqueciSenhaPage() {
  const runRequestReset = useServerFn(requestPasswordReset);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/redefinir-senha`;
      const result = await runRequestReset({ data: { email, redirectTo } });
      if (!result.success) throw new Error(result.error ?? "Não foi possível enviar o e-mail.");
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível enviar o e-mail."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
            <Zap className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">LowTicket AI</span>
        </Link>

        {sent ? (
          <div className="space-y-4 rounded-xl border border-success/20 bg-success/10 p-6 text-center">
            <CheckCircle2 className="mx-auto size-8 text-success" />
            <div className="space-y-1">
              <h2 className="font-display text-xl">E-mail enviado!</h2>
              <p className="text-sm text-muted-foreground">
                Se existir uma conta com esse e-mail, você vai receber um link pra redefinir a senha
                em instantes.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block text-sm font-medium underline underline-offset-4"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <h2 className="font-display text-3xl leading-tight">Esqueceu a senha?</h2>
              <p className="text-sm text-muted-foreground">
                Digite seu e-mail e enviamos um link para você criar uma nova senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full gap-2 shadow-glow" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Enviar link
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Lembrou a senha?{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

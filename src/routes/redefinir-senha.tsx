import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error-message";
import { exchangePasswordResetCode, updatePassword } from "@/lib/auth.functions";

export const Route = createFileRoute("/redefinir-senha")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search["code"] === "string" ? search["code"] : undefined,
  }),
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ deps }) => {
    if (!deps.code) return { ready: false, error: "Link inválido ou incompleto." };
    const result = await exchangePasswordResetCode({ data: { code: deps.code } });
    return { ready: result.success, error: result.success ? null : result.error };
  },
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const { ready, error: loaderError } = Route.useLoaderData();
  const navigate = useNavigate();
  const runUpdatePassword = useServerFn(updatePassword);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const result = await runUpdatePassword({ data: { password } });
      if (!result.success) throw new Error(result.error ?? "Não foi possível redefinir a senha.");
      setSuccess(true);
      setTimeout(() => navigate({ to: "/login" }), 2000);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível redefinir a senha."));
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

        {!ready ? (
          <div className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <h2 className="font-display text-xl">Link inválido ou expirado</h2>
            <p className="text-sm text-muted-foreground">
              {loaderError ?? "Solicite um novo link de redefinição de senha."}
            </p>
            <Link to="/esqueci-senha" className="inline-block text-sm font-medium underline underline-offset-4">
              Solicitar novo link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-4 rounded-xl border border-success/20 bg-success/10 p-6 text-center">
            <CheckCircle2 className="mx-auto size-8 text-success" />
            <div className="space-y-1">
              <h2 className="font-display text-xl">Senha redefinida!</h2>
              <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <h2 className="font-display text-3xl leading-tight">Criar nova senha</h2>
              <p className="text-sm text-muted-foreground">Escolha uma senha com pelo menos 6 caracteres.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                Salvar nova senha
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

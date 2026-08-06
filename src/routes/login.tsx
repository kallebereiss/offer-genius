import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error-message";
import { signIn } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const HIGHLIGHTS = [
  { icon: Sparkles, text: "Ofertas completas geradas por IA em minutos" },
  { icon: Target, text: "Copy, funil e landing page prontos pra vender" },
  { icon: TrendingUp, text: "Seus dados salvos com segurança na nuvem" },
];

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const runSignIn = useServerFn(signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await runSignIn({ data: { email, password } });
      if (!result.success) throw new Error(result.error ?? "Não foi possível entrar.");
      await router.invalidate();
      await navigate({ to: "/" });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Zap className="size-4.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">LowTicket AI</span>
        </Link>

        <div className="relative space-y-8">
          <h1 className="font-display text-4xl leading-tight text-balance">
            Transforme ideias em ofertas que vendem
          </h1>
          <div className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm text-primary-foreground/90">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} LowTicket AI. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm space-y-8">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
              <Zap className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">LowTicket AI</span>
          </Link>

          <div className="space-y-1.5">
            <h2 className="font-display text-3xl leading-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">Entre para continuar criando ofertas.</p>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/esqueci-senha" className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
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

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2 shadow-glow" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-foreground underline underline-offset-4">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

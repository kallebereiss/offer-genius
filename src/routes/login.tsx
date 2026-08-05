import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const runSignIn = useServerFn(signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await runSignIn({ data: { email, password } });
      await router.invalidate();
      await navigate({ to: "/" });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta do LowTicket AI</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Entrar
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-medium text-foreground underline underline-offset-4">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

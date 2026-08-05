import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth.functions";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const runSignUp = useServerFn(signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await runSignUp({ data: { name, email, password } });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/login" }), 2000);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível criar a conta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comece a gerar ofertas com IA</p>
        </div>
        {success ? (
          <p className="text-center text-sm text-muted-foreground">
            Conta criada! Se a confirmação de e-mail estiver ativa no Supabase, confirme antes de
            entrar. Redirecionando para o login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Criar conta
            </Button>
          </form>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

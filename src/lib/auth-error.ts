const DICTIONARY: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Já existe uma conta com esse e-mail.",
};

export function describeAuthError(message: string | undefined, status?: number): string {
  const clean = (message ?? "").trim();
  if (clean && clean !== "{}" && DICTIONARY[clean]) return DICTIONARY[clean]!;
  if (!clean || clean === "{}" || status === 500) {
    return "O banco de dados recusou a operação (erro 500 no Auth). Normalmente é um trigger em auth.users com problema no seu projeto Supabase.";
  }
  return clean;
}

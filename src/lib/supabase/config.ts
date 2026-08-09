/**
 * Supabase credentials resolution.
 *
 * If you want to use YOUR OWN Supabase project, set these in `.env`:
 *   VITE_OWN_SUPABASE_URL=https://<seu-projeto>.supabase.co
 *   VITE_OWN_SUPABASE_ANON_KEY=<sua anon/publishable key>
 *
 * They take priority over the built-in managed backend credentials.
 */
export function getSupabaseUrl(): string {
  return (import.meta.env["VITE_OWN_SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"]) as string;
}

export function getSupabaseAnonKey(): string {
  return (import.meta.env["VITE_OWN_SUPABASE_ANON_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) as string;
}

export function getServerSupabaseUrl(): string {
  return (process.env["OWN_SUPABASE_URL"] ??
    import.meta.env["VITE_OWN_SUPABASE_URL"] ??
    process.env["SUPABASE_URL"] ??
    import.meta.env["VITE_SUPABASE_URL"]) as string;
}

export function getServerSupabaseAnonKey(): string {
  return (process.env["OWN_SUPABASE_ANON_KEY"] ??
    import.meta.env["VITE_OWN_SUPABASE_ANON_KEY"] ??
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) as string;
}

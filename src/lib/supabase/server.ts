import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

export function getSupabaseServerClient() {
  return createServerClient(
    (process.env['SUPABASE_URL'] ?? import.meta.env['VITE_SUPABASE_URL']) as string,
    (process.env['SUPABASE_PUBLISHABLE_KEY'] ??
      import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY']) as string,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value: value ?? "",
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value);
          });
        },
      },
    },
  );
}

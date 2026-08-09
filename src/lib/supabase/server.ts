import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { getServerSupabaseAnonKey, getServerSupabaseUrl } from "./config";

export function getSupabaseServerClient() {
  return createServerClient(getServerSupabaseUrl(), getServerSupabaseAnonKey(), {
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
  });
}

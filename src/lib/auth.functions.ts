import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "./supabase/server";
import { describeAuthError } from "./auth-error";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
});

const credentialsInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentialsInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) return { success: false as const, error: describeAuthError(error.message, error.status) };
    return { success: true as const, error: null };
  });

const signUpInput = credentialsInput.extend({
  name: z.string().min(1),
});

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signUpInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name } },
    });
    if (error) return { success: false as const, error: describeAuthError(error.message, error.status) };
    return { success: true as const, error: null };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  return { success: true };
});

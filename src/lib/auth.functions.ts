import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "./supabase/server";
import { describeAuthError } from "./auth-error";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (data.user.user_metadata?.["full_name"] as string | undefined) ?? "",
  };
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
    if (error)
      return { success: false as const, error: describeAuthError(error.message, error.status) };
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
    if (error)
      return { success: false as const, error: describeAuthError(error.message, error.status) };
    return { success: true as const, error: null };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  return { success: true };
});

const updateProfileInput = z.object({
  name: z.string().min(1),
});

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateProfileInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: data.name } });
    if (error)
      return { success: false as const, error: describeAuthError(error.message, error.status) };
    return { success: true as const, error: null };
  });

const requestResetInput = z.object({
  email: z.string().email(),
  redirectTo: z.string().url(),
});

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => requestResetInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo,
    });
    if (error)
      return { success: false as const, error: describeAuthError(error.message, error.status) };
    return { success: true as const, error: null };
  });

const exchangeCodeInput = z.object({ code: z.string() });

export const exchangePasswordResetCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => exchangeCodeInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(data.code);
    if (error)
      return { success: false as const, error: describeAuthError(error.message, error.status) };
    return { success: true as const, error: null };
  });

const updatePasswordInput = z.object({ password: z.string().min(6) });

export const updatePassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updatePasswordInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error)
      return { success: false as const, error: describeAuthError(error.message, error.status) };
    await supabase.auth.signOut();
    return { success: true as const, error: null };
  });

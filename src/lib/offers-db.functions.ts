import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "./supabase/server";
import type { Brief, GeneratedOffer, OfferProject } from "./offer-schema";

type OfferRow = {
  id: string;
  favorite: boolean;
  archived: boolean;
  brief: Brief;
  offer: GeneratedOffer;
  created_at: string;
};

function rowToProject(row: OfferRow): OfferProject {
  return {
    id: row.id,
    createdAt: row.created_at,
    favorite: row.favorite,
    archived: row.archived,
    brief: row.brief,
    offer: row.offer,
  };
}

export const listOffers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id, favorite, archived, brief, offer, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OfferRow[]).map(rowToProject);
});

const createInput = z.object({
  id: z.string(),
  brief: z.custom<Brief>(),
  offer: z.custom<GeneratedOffer>(),
});

export const createOfferRow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Não autenticado.");
    const { error } = await supabase.from("offers").insert({
      id: data.id,
      user_id: userData.user.id,
      brief: data.brief,
      offer: data.offer,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

const updateProjectInput = z.object({
  id: z.string(),
  patch: z.object({
    favorite: z.boolean().optional(),
    archived: z.boolean().optional(),
  }),
});

export const updateProjectRow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateProjectInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("offers").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

const updateOfferInput = z.object({
  id: z.string(),
  offer: z.custom<GeneratedOffer>(),
});

export const updateOfferRow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateOfferInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("offers")
      .update({ offer: data.offer })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

const idInput = z.object({ id: z.string() });

export const deleteOfferRow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("offers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

const duplicateInput = z.object({ sourceId: z.string(), newId: z.string() });

export const duplicateOfferRow = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => duplicateInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Não autenticado.");
    const { data: source, error: fetchError } = await supabase
      .from("offers")
      .select("brief, offer")
      .eq("id", data.sourceId)
      .single();
    if (fetchError) throw new Error(fetchError.message);
    const offer = source.offer as GeneratedOffer;
    const { error } = await supabase.from("offers").insert({
      id: data.newId,
      user_id: userData.user.id,
      brief: source.brief,
      offer: { ...offer, productName: `${offer.productName} (cópia)` },
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

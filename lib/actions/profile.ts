"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";

export async function upsertProfileAction(formData: FormData) {
  const supabase = getServerSupabase();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  const nom = (formData.get("nom") || "").toString().trim();
  const prenom = (formData.get("prenom") || "").toString().trim();
  const telephone = (formData.get("telephone") || "").toString().trim() || null;
  const specialite = (formData.get("specialite") || "").toString().trim() || null;
  const service = (formData.get("service") || "").toString().trim() || null;
  const avatar_url = (formData.get("avatar_url") || "").toString().trim() || null;

  if (!nom || !prenom) {
    // Missing required fields; send back to setup
    redirect("/profile/setup?error=missing_fields");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: "patient",
    nom,
    prenom,
    telephone,
    specialite,
    service,
    avatar_url,
  } as const;

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    redirect(`/profile/setup?error=${encodeURIComponent(error.message)}`);
  }

  // On success, send the user to their default area
  redirect("/patient");
}


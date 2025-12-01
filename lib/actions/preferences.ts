"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";

const ALLOWED_ROLES = new Set(["admin", "medecin", "infirmiere"]);

export async function updatePreferencesAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/auth/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) redirect("/post-login");

  const role = profile?.role || "patient";
  if (!ALLOWED_ROLES.has(role)) {
    redirect(`/${role}`);
  }

  const specialite = (formData.get("specialite") || "").toString().trim() || null;
  const service = (formData.get("service") || "").toString().trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ specialite, service })
    .eq("id", user.id);
  if (error) {
    redirect(`/preferences?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${role}`);
}


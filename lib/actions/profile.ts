"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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
  const countryCodeRaw = (formData.get("country_code") || "").toString().trim();
  const phoneRaw = (formData.get("phone_number") || "").toString().trim();
  const avatar_url = (formData.get("avatar_url") || "").toString().trim() || null;

  if (!nom || !prenom) {
    // Missing required fields; send back to setup
    redirect("/profile/setup?error=missing_fields");
  }

  // Build and validate E.164 phone number if provided
  let telephone: string | null = null;
  if (countryCodeRaw || phoneRaw) {
    const ccDigits = countryCodeRaw.replace(/[^0-9]/g, "");
    const phoneDigits = phoneRaw.replace(/[^0-9]/g, "");
    const constructed = `+${ccDigits}${phoneDigits}`;
    const e164 = /^\+[1-9]\d{6,14}$/;
    if (!ccDigits || !phoneDigits || !e164.test(constructed)) {
      redirect("/profile/setup?error=invalid_phone");
    }
    telephone = constructed;
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: "patient",
    nom,
    prenom,
    telephone,
    avatar_url,
  } as const;

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    redirect(`/profile/setup?error=${encodeURIComponent(error.message)}`);
  }

  // Fetch the role from the profile to route correctly and set cookie
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || "patient";
  const cookieStore = cookies();
  cookieStore.set({ name: "role", value: role, path: "/" });
  redirect(`/${role}`);
}

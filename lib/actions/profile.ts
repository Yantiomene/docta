"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSupabase } from "@/lib/supabaseServer";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export async function upsertProfileAction(formData: FormData) {
  const supabase = getServerSupabase();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  const nom = (formData.get("nom") || "").toString().trim();
  const prenom = (formData.get("prenom") || "").toString().trim();
  const countryIsoRaw = (formData.get("country_code") || "").toString().trim();
  const phoneRaw = (formData.get("phone_number") || "").toString().trim();
  const avatar_url = (formData.get("avatar_url") || "").toString().trim() || null;

  if (!nom || !prenom) {
    // Missing required fields; send back to setup
    redirect("/profile/setup?error=missing_fields");
  }

  // Require phone and validate using libphonenumber-js with defaultCountry
  if (!countryIsoRaw || !phoneRaw) {
    redirect("/profile/setup?error=missing_phone");
  }
  const defaultCountry = countryIsoRaw as CountryCode;
  const constructed = phoneRaw;
  let telephone = constructed;
  try {
    const phone = parsePhoneNumberFromString(constructed, { defaultCountry });
    if (!phone || !phone.isValid()) {
      redirect("/profile/setup?error=invalid_phone");
    }
    telephone = phone.format("E.164"); // normalized E.164
  } catch {
    // Fallback: support already-E.164 numbers without defaultCountry
    const phone = parsePhoneNumberFromString(constructed);
    if (!phone || !phone.isValid()) {
      redirect("/profile/setup?error=invalid_phone");
    }
    telephone = phone.format("E.164");
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

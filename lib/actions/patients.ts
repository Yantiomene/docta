"use server";

import { redirect } from "next/navigation";
import { PatientSchema } from "@/lib/schemas";
import { getServiceSupabase } from "@/lib/supabaseServer";

export async function createPatientAction(formData: FormData) {
  // Extract and sanitize fields
  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim() || undefined;
  const phone = (formData.get("phone") || "").toString().trim() || undefined;
  const dob = (formData.get("dob") || "").toString().trim() || undefined; // ISO date string
  const genderRaw = (formData.get("gender") || "").toString().trim();
  const gender = genderRaw ? (genderRaw as "male" | "female" | "other") : undefined;

  // Validate with Zod schema
  const parsed = PatientSchema.safeParse({ firstName, lastName, email, phone, dob, gender });
  if (!parsed.success) {
    // Encode first issue message and redirect back with error
    const msg = parsed.error.issues?.[0]?.message || "Invalid fields";
    redirect(`/medecin/patients/create?error=${encodeURIComponent(msg)}`);
  }

  const supabase = getServiceSupabase();
  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: email ?? null,
    phone: phone ?? null,
    dob: dob ?? null,
    gender: gender ?? null,
    created_at: new Date().toISOString(),
  } as const;

  const { error } = await supabase.from("patients").insert(payload);
  if (error) {
    redirect(`/medecin/patients/create?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/medecin/patients");
}

"use server";

import { redirect } from "next/navigation";
import { PatientSchema } from "@/lib/schemas";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import { RolePaths } from "@/lib/rbac";

export async function createPatientAction(formData: FormData) {
  // Extract and sanitize fields
  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim() || undefined;
  const phone = (formData.get("phone") || "").toString().trim() || undefined;
  const dob = (formData.get("dob") || "").toString().trim() || undefined; // ISO date string
  const genderRaw = (formData.get("gender") || "").toString().trim();
  const gender = genderRaw ? (genderRaw as "male" | "female" | "other") : undefined;
  const bloodTypeRaw = (formData.get("bloodType") || "").toString().trim();
  const bloodType = bloodTypeRaw
    ? (bloodTypeRaw as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-")
    : undefined;

  // Validate with Zod schema
  const parsed = PatientSchema.safeParse({ firstName, lastName, email, phone, dob, gender, bloodType });
  if (!parsed.success) {
    // Encode first issue message and redirect back with error
    const msg = parsed.error.issues?.[0]?.message || "Invalid fields";
    redirect(`/medecin/patients/create?error=${encodeURIComponent(msg)}`);
  }

  const supabase = getServerSupabase();
  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: email ?? null,
    phone: phone ?? null,
    dob: dob ?? null,
    gender: gender ?? null,
    blood_type: bloodType ?? null,
    managed_by_staff: true,
    created_at: new Date().toISOString(),
  } as const;

  // Business logic: avoid duplicates by upserting on email or phone when provided
  let error: { message: string } | null = null;
  if (email) {
    const res = await supabase.from("patients").upsert(payload, { onConflict: "email" });
    error = res.error;
  } else if (phone) {
    const res = await supabase.from("patients").upsert(payload, { onConflict: "phone" });
    error = res.error;
  } else {
    const res = await supabase.from("patients").insert(payload);
    error = res.error;
  }
  if (error) {
    redirect(`/medecin/patients/create?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/medecin/patients");
}

// Staff flow: create or link a patient dossier to a selected user, deduping by email/phone
export async function staffCreateOrLinkPatientAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // Ensure staff role
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}`);
  }

  // Extract fields
  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim() || undefined;
  const phone = (formData.get("phone") || "").toString().trim() || undefined;
  const dob = (formData.get("dob") || "").toString().trim() || undefined; // ISO date
  const genderRaw = (formData.get("gender") || "").toString().trim();
  const gender = genderRaw ? (genderRaw as "male" | "female" | "other") : undefined;
  const bloodTypeRaw = (formData.get("bloodType") || "").toString().trim();
  const bloodType = bloodTypeRaw
    ? (bloodTypeRaw as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-")
    : undefined;
  const selectedUserId = (formData.get("user_id") || "").toString().trim() || undefined;

  // Validate
  const parsed = PatientSchema.safeParse({ firstName, lastName, email, phone, dob, gender, bloodType });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Invalid fields";
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent(msg)}&form=open`);
  }

  const basePayload = {
    first_name: firstName,
    last_name: lastName,
    email: email ?? null,
    phone: phone ?? null,
    dob: dob ?? null,
    gender: gender ?? null,
    blood_type: bloodType ?? null,
    managed_by_staff: true,
  } as const;

  // If a user is selected, link or merge into existing record
  if (selectedUserId) {
    // Try existing record by user_id
    const { data: byUser } = await supabase
      .from("patients")
      .select("id, email, phone")
      .eq("user_id", selectedUserId)
      .maybeSingle();

    if (byUser) {
      const { error } = await supabase
        .from("patients")
        .update({ ...basePayload, user_id: selectedUserId, updated_at: new Date().toISOString() })
        .eq("id", byUser.id);
      if (error) {
        redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent(error.message)}&form=open`);
      }
      redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?success=${encodeURIComponent("Dossier lié et mis à jour")}`);
    }

    // No record by user_id: attempt to merge by email or phone
    // Prefer email first
    if (email) {
      const { data: byEmail } = await supabase
        .from("patients")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (byEmail) {
        // If phone also conflicts with a different record, surface error
        if (phone) {
          const { data: byPhone } = await supabase
            .from("patients")
            .select("id")
            .eq("phone", phone)
            .maybeSingle();
          if (byPhone && byPhone.id !== byEmail.id) {
            redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent("Conflit: email et téléphone appartiennent à deux dossiers différents.")}&form=open`);
          }
        }
        const { error } = await supabase
          .from("patients")
          .update({ ...basePayload, user_id: selectedUserId, updated_at: new Date().toISOString() })
          .eq("id", byEmail.id);
        if (error) {
          redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent(error.message)}&form=open`);
        }
        redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?success=${encodeURIComponent("Dossier lié au compte utilisateur")}`);
      }
    }

    if (phone) {
      const { data: byPhone } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();
      if (byPhone) {
        const { error } = await supabase
          .from("patients")
          .update({ ...basePayload, user_id: selectedUserId, updated_at: new Date().toISOString() })
          .eq("id", byPhone.id);
        if (error) {
          redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent(error.message)}&form=open`);
        }
        redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?success=${encodeURIComponent("Dossier lié au compte utilisateur")}`);
      }
    }

    // No existing record: create new linked to selected user
    const { error } = await supabase
      .from("patients")
      .insert({ ...basePayload, user_id: selectedUserId, created_at: new Date().toISOString() });
    if (error) {
      redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent(error.message)}&form=open`);
    }
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?success=${encodeURIComponent("Dossier créé et lié au compte utilisateur")}`);
  }

  // No user selected: allow creation without account, dedupe by email/phone
  let error: { message: string } | null = null;
  if (email) {
    const res = await supabase.from("patients").upsert({ ...basePayload, created_at: new Date().toISOString() }, { onConflict: "email" });
    error = res.error;
  } else if (phone) {
    const res = await supabase.from("patients").upsert({ ...basePayload, created_at: new Date().toISOString() }, { onConflict: "phone" });
    error = res.error;
  } else {
    const res = await supabase.from("patients").insert({ ...basePayload, created_at: new Date().toISOString() });
    error = res.error;
  }
  if (error) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent(error.message)}&form=open`);
  }
  redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?success=${encodeURIComponent("Dossier créé (sans compte)")}`);
}

// Patient self-managed dossier upsert: create or update their own record keyed by user_id
export async function upsertSelfPatientAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  // If dossier is already staff-managed, prevent patient updates
  const { data: existing } = await supabase
    .from("patients")
    .select("id, managed_by_staff")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing && existing.managed_by_staff) {
    redirect(
      `/patient/dossier?error=${encodeURIComponent(
        "Votre dossier est géré par l'équipe médicale et ne peut pas être modifié."
      )}`
    );
  }

  // Extract and sanitize fields
  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim() || undefined;
  const phone = (formData.get("phone") || "").toString().trim() || undefined;
  const dob = (formData.get("dob") || "").toString().trim() || undefined; // ISO date string
  const genderRaw = (formData.get("gender") || "").toString().trim();
  const gender = genderRaw ? (genderRaw as "male" | "female" | "other") : undefined;
  const bloodTypeRaw = (formData.get("bloodType") || "").toString().trim();
  const bloodType = bloodTypeRaw
    ? (bloodTypeRaw as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-")
    : undefined;

  // Validate with Zod schema (gender required, bloodType optional)
  const parsed = PatientSchema.safeParse({ firstName, lastName, email, phone, dob, gender, bloodType });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Invalid fields";
    redirect(`/patient?error=${encodeURIComponent(msg)}`);
  }

  const payload = {
    user_id: user!.id,
    first_name: firstName,
    last_name: lastName,
    email: email ?? null,
    phone: phone ?? null,
    dob: dob ?? null,
    gender: gender!,
    blood_type: bloodType ?? null,
    updated_at: new Date().toISOString(),
  } as const;

  // Check for duplicates on email or phone linked to a different user
  if (email) {
    const { data: dupByEmail } = await supabase
      .from("patients")
      .select("id, user_id, managed_by_staff")
      .eq("email", email)
      .maybeSingle();
    if (dupByEmail && dupByEmail.user_id && dupByEmail.user_id !== user.id) {
      redirect(
        `/patient/dossier?error=${encodeURIComponent(
          "Un dossier existe déjà pour cet email. Contactez le support."
        )}`
      );
    }
  }
  if (phone) {
    const { data: dupByPhone } = await supabase
      .from("patients")
      .select("id, user_id, managed_by_staff")
      .eq("phone", phone)
      .maybeSingle();
    if (dupByPhone && dupByPhone.user_id && dupByPhone.user_id !== user.id) {
      redirect(
        `/patient/dossier?error=${encodeURIComponent(
          "Un dossier existe déjà pour ce numéro de téléphone. Contactez le support."
        )}`
      );
    }
  }

  // Upsert by user_id to create or update patient's own dossier
  const { error } = await supabase.from("patients").upsert(payload, { onConflict: "user_id" });

  if (error) {
    redirect(`/patient/dossier?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/patient/dossier?success=${encodeURIComponent("Dossier enregistré")}`);
}

// Staff: update an existing patient dossier
export async function updatePatientAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // Ensure staff role
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}`);
  }

  const id = (formData.get("patient_id") || "").toString().trim();
  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim() || undefined;
  const phone = (formData.get("phone") || "").toString().trim() || undefined;
  const dob = (formData.get("dob") || "").toString().trim() || undefined;
  const genderRaw = (formData.get("gender") || "").toString().trim();
  const gender = genderRaw ? (genderRaw as "male" | "female" | "other") : undefined;
  const bloodTypeRaw = (formData.get("bloodType") || "").toString().trim();
  const bloodType = bloodTypeRaw
    ? (bloodTypeRaw as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-")
    : undefined;

  if (!id) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent("Patient ID manquant")}`);
  }

  // Validate payload
  const parsed = PatientSchema.safeParse({ firstName, lastName, email, phone, dob, gender, bloodType });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Invalid fields";
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?pid=${encodeURIComponent(id)}&error=${encodeURIComponent(msg)}`);
  }

  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: email ?? null,
    phone: phone ?? null,
    dob: dob ?? null,
    gender: gender ?? null,
    blood_type: bloodType ?? null,
    updated_at: new Date().toISOString(),
  } as const;

  const { error } = await supabase.from("patients").update(payload).eq("id", id);
  if (error) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?pid=${encodeURIComponent(id)}&error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?pid=${encodeURIComponent(id)}&success=${encodeURIComponent("Dossier mis à jour")}`);
}

// Admin: delete a patient dossier
export async function deletePatientAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // Ensure admin role via service client
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const isAdmin = role === "admin";
  if (!isAdmin) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent("Suppression réservée aux administrateurs")}`);
  }

  const id = (formData.get("patient_id") || "").toString().trim();
  if (!id) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?error=${encodeURIComponent("Patient ID manquant")}`);
  }

  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) {
    redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?pid=${encodeURIComponent(id)}&error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/${RolePaths[role as keyof typeof RolePaths]}/patients?success=${encodeURIComponent("Dossier supprimé")}`);
}

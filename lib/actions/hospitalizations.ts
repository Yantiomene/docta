"use server";

import { redirect } from "next/navigation";
import { HospitalizationSchema, UpdateHospitalizationSchema } from "@/lib/schemas";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";

// Staff: create a hospitalization
export async function createHospitalizationAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // Ensure staff role via service client
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser!.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Accès refusé: rôle staff requis")}`);
  }

  const patientId = (formData.get("patientId") || "").toString().trim();
  const ward = (formData.get("ward") || "").toString().trim() || undefined;
  const room = (formData.get("room") || "").toString().trim() || undefined;
  const bed = (formData.get("bed") || "").toString().trim() || undefined;
  const admittedAt = (formData.get("admittedAt") || "").toString().trim();
  const dischargedAt = (formData.get("dischargedAt") || "").toString().trim() || undefined;
  const statusRaw = (formData.get("status") || "active").toString().trim();
  const status = statusRaw as "active" | "discharged" | "planned";

  const parsed = HospitalizationSchema.safeParse({ patientId, ward, room, bed, admittedAt, dischargedAt, status });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Champs invalides";
    const ts = Date.now();
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(msg)}&ts=${ts}`);
  }

  const svc = getServiceSupabase();
  const { data: patientRow, error: patientErr } = await svc
    .from("patients")
    .select("id, user_id, dob")
    .eq("id", patientId)
    .maybeSingle();
  if (patientErr || !patientRow || !patientRow.user_id) {
    const ts = Date.now();
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Patient introuvable ou non lié à un profil utilisateur")}&ts=${ts}`);
  }
  const profileId = String(patientRow.user_id);
  const { data: dossier, error: dossierErr } = await svc
    .from("dossiers_patients")
    .select("id")
    .eq("patient_id", profileId)
    .maybeSingle();
  let dossierId = dossier?.id as string | undefined;
  if (!dossierId) {
    const numero = `DP-${Date.now()}`;
    const { data: created, error: createdErr } = await svc
      .from("dossiers_patients")
      .insert({
        patient_id: profileId,
        numero_dossier: numero,
        date_naissance: patientRow.dob ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (createdErr || !created) {
      const ts = Date.now();
      redirect(`/admin/hospitalizations?error=${encodeURIComponent("Création du dossier patient impossible")}&ts=${ts}`);
    }
    dossierId = created.id as string;
  }

  const statut = status === "active" ? "en_cours" : status === "discharged" ? "sortie" : "en_cours";
  const payload = {
    dossier_patient_id: dossierId,
    service: ward ?? null,
    chambre: room ?? null,
    lit: bed ?? null,
    date_admission: admittedAt,
    date_sortie_reelle: dischargedAt ?? null,
    statut,
    created_at: new Date().toISOString(),
  } as const;

  const { error } = await supabase.from("hospitalisations").insert(payload);
  if (error) {
    const ts = Date.now();
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(error.message)}&ts=${ts}`);
  }
  const ts = Date.now();
  redirect(`/admin/hospitalizations?success=${encodeURIComponent("Hospitalisation créée")}&ts=${ts}`);
}

// Staff: discharge a hospitalization (set status + timestamp)
export async function dischargeHospitalizationAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser!.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Accès refusé: rôle staff requis")}`);
  }

  const id = (formData.get("hospitalization_id") || "").toString().trim();
  if (!id) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Hospitalisation ID manquant")}`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("hospitalisations")
    .update({ statut: "sortie", date_sortie_reelle: now, updated_at: now })
    .eq("id", id);
  if (error) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/hospitalizations?success=${encodeURIComponent("Patient sorti")}`);
}

// Admin: delete a hospitalization
export async function deleteHospitalizationAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // Ensure admin role via service client
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser!.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const isAdmin = role === "admin";
  if (!isAdmin) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Suppression réservée aux administrateurs")}`);
  }

  const id = (formData.get("hospitalization_id") || "").toString().trim();
  if (!id) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Hospitalisation ID manquant")}`);
  }

  const { error } = await supabase.from("hospitalisations").delete().eq("id", id);
  if (error) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/hospitalizations?success=${encodeURIComponent("Hospitalisation supprimée")}`);
}

// Staff: update a hospitalization (edit fields)
export async function updateHospitalizationAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser!.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    const ts = Date.now();
    redirect(`/admin/hospitalizations?error=${encodeURIComponent("Accès refusé: rôle staff requis")}&ts=${ts}`);
  }

  const id = (formData.get("hospitalization_id") || "").toString().trim();
  const ward = (formData.get("ward") || "").toString().trim() || undefined;
  const room = (formData.get("room") || "").toString().trim() || undefined;
  const bed = (formData.get("bed") || "").toString().trim() || undefined;
  const admittedAt = (formData.get("admittedAt") || "").toString().trim() || undefined;
  const dischargedAt = (formData.get("dischargedAt") || "").toString().trim() || undefined;
  const statusRaw = (formData.get("status") || "").toString().trim() || undefined;
  const status = statusRaw ? (statusRaw as "active" | "discharged" | "planned") : undefined;

  const parsed = UpdateHospitalizationSchema.safeParse({ id, ward, room, bed, admittedAt, dischargedAt, status });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Champs invalides";
    const ts = Date.now();
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(msg)}&ts=${ts}`);
  }

  const payload: any = {};
  if (ward !== undefined) payload.service = ward || null;
  if (room !== undefined) payload.chambre = room || null;
  if (bed !== undefined) payload.lit = bed || null;
  if (admittedAt !== undefined) payload.date_admission = admittedAt;
  if (dischargedAt !== undefined) payload.date_sortie_reelle = dischargedAt || null;
  if (status !== undefined) payload.statut = status === "active" ? "en_cours" : status === "discharged" ? "sortie" : "en_cours";
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("hospitalisations")
    .update(payload)
    .eq("id", id);
  if (error) {
    const ts = Date.now();
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(error.message)}&ts=${ts}`);
  }
  const ts = Date.now();
  redirect(`/admin/hospitalizations?success=${encodeURIComponent("Hospitalisation mise à jour")}&ts=${ts}`);
}

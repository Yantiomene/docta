"use server";

import { redirect } from "next/navigation";
import { HospitalizationSchema } from "@/lib/schemas";
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

  const payload = {
    patient_id: patientId,
    ward: ward ?? null,
    room: room ?? null,
    bed: bed ?? null,
    admitted_at: admittedAt,
    discharged_at: dischargedAt ?? null,
    status,
    created_at: new Date().toISOString(),
  } as const;

  const { error } = await supabase.from("hospitalizations").insert(payload);
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
    .from("hospitalizations")
    .update({ status: "discharged", discharged_at: now, updated_at: now })
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

  const { error } = await supabase.from("hospitalizations").delete().eq("id", id);
  if (error) {
    redirect(`/admin/hospitalizations?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/hospitalizations?success=${encodeURIComponent("Hospitalisation supprimée")}`);
}

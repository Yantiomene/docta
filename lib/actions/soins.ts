"use server";

import { redirect } from "next/navigation";
import { SoinSchema } from "@/lib/schemas";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";

// Create a soin (staff-only: admin, medecin, infirmiere)
export async function createSoinAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // RBAC: ensure staff
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser!.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const basePath = role === "admin" ? "/admin/soins" : role === "medecin" ? "/medecin/soins" : "/infirmiere/soins";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`${basePath}?error=${encodeURIComponent("Accès refusé: rôle staff requis")}`);
  }

  // Extract fields
  const patientId = (formData.get("patientId") || "").toString().trim();
  const typeSoin = (formData.get("typeSoin") || "").toString().trim();
  const title = (formData.get("title") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim() || undefined;
  const scheduledAt = (formData.get("scheduledAt") || "").toString().trim();
  const assignedToNurseId = (formData.get("assignedToNurseId") || "").toString().trim() || undefined;
  const statusRaw = (formData.get("status") || "").toString().trim() || "scheduled";
  const status = statusRaw as "scheduled" | "in_progress" | "done" | "missed";

  const parsed = SoinSchema.safeParse({ patientId, typeSoin, title, description, scheduledAt, assignedToNurseId, status });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Champs invalides";
    redirect(`${basePath}?error=${encodeURIComponent(msg)}`);
  }

  // Validate that the patient is hospitalized at the scheduled time
  const scheduled = new Date(scheduledAt);
  if (isNaN(scheduled.getTime())) {
    redirect(`${basePath}?error=${encodeURIComponent("Date/heure planifiées invalides")}`);
  }

  const { data: hosps, error: hospErr } = await supabase
    .from("hospitalizations")
    .select("id, admitted_at, discharged_at, status")
    .eq("patient_id", patientId)
    .or("status.eq.active,status.eq.planned");
  if (hospErr) {
    redirect(`${basePath}?error=${encodeURIComponent(hospErr.message)}`);
  }
  const matchingHosps = (hosps || []).filter((h) => {
    const admitted = new Date((h as any).admitted_at);
    const dischargedRaw = (h as any).discharged_at as string | null;
    const discharged = dischargedRaw ? new Date(dischargedRaw) : null;
    const status = String((h as any).status || "");
    if (isNaN(admitted.getTime())) return false;
    const withinStay = discharged ? scheduled >= admitted && scheduled <= discharged : scheduled >= admitted;
    const statusOk = status === "active" || status === "planned";
    return statusOk && withinStay;
  });
  if (!matchingHosps || matchingHosps.length === 0) {
    redirect(`${basePath}?error=${encodeURIComponent("Le patient n'est pas hospitalisé à la date prévue")}`);
  }
  // Choisir l’hospitalisation la plus pertinente (la plus récente avant la date planifiée)
  const selectedHosp = matchingHosps
    .map((h: any) => ({ id: h.id as string, admitted_at: new Date(h.admitted_at as string) }))
    .sort((a, b) => b.admitted_at.getTime() - a.admitted_at.getTime())[0];
  const hospitalisationId = selectedHosp?.id;

  const payload = {
    patient_id: patientId,
    type_soin: typeSoin || title || "Autre",
    title,
    description: description ?? "",
    scheduled_at: scheduledAt,
    assigned_to_nurse_id: assignedToNurseId ?? null,
    status,
    hospitalisation_id: hospitalisationId,
    created_at: new Date().toISOString(),
  } as const;

  const { error } = await supabase.from("soins").insert(payload);
  if (error) {
    redirect(`${basePath}?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`${basePath}?success=${encodeURIComponent("Soin créé")}`);
}

// Update a soin's status (staff-only)
export async function updateSoinStatusAction(formData: FormData) {
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
    redirect(`/infirmiere/soins?error=${encodeURIComponent("Accès refusé: rôle staff requis")}`);
  }

  const id = (formData.get("soin_id") || "").toString().trim();
  const statusRaw = (formData.get("status") || "").toString().trim();
  const status = statusRaw as "scheduled" | "in_progress" | "done" | "missed";

  if (!id || !status) {
    redirect(`/infirmiere/soins?error=${encodeURIComponent("ID ou statut manquant")}`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("soins")
    .update({ status, updated_at: now })
    .eq("id", id);
  if (error) {
    redirect(`/infirmiere/soins?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/infirmiere/soins?success=${encodeURIComponent("Statut du soin mis à jour")}`);
}

// Delete a soin (admin-only)
export async function deleteSoinAction(formData: FormData) {
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
  if (role !== "admin") {
    redirect(`/infirmiere/soins?error=${encodeURIComponent("Accès refusé: admin requis pour supprimer")}`);
  }

  const id = (formData.get("soin_id") || "").toString().trim();
  if (!id) {
    redirect(`/infirmiere/soins?error=${encodeURIComponent("Soin ID manquant")}`);
  }

  const { error } = await supabase.from("soins").delete().eq("id", id);
  if (error) {
    redirect(`/infirmiere/soins?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/infirmiere/soins?success=${encodeURIComponent("Soin supprimé")}`);
}

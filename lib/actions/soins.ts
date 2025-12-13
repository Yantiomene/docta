"use server";

import { redirect } from "next/navigation";
import { SoinSchema } from "@/lib/schemas";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import { toUTCFromLocalInput } from "@/lib/utils";

// Helper: derive HH:MM:SS from a datetime-local string
function extractHeurePrevue(scheduledAt: string): string {
  if (!scheduledAt) return "00:00:00";
  const m = scheduledAt.match(/T(\d{2}:\d{2})/);
  if (m && m[1]) return `${m[1]}:00`;
  try {
    const d = new Date(scheduledAt);
    if (isNaN(d.getTime())) return "00:00:00";
    const pad = (n: number) => String(n).padStart(2, "0");
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${hh}:${mi}:00`;
  } catch {
    return "00:00:00";
  }
}

// Helper: derive YYYY-MM-DD (date) from a datetime-local string
function extractDateDebut(scheduledAt: string): string {
  if (!scheduledAt) return new Date().toISOString().slice(0, 10);
  const parts = scheduledAt.split("T");
  if (parts[0]) return parts[0];
  try {
    const d = new Date(scheduledAt);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }
}

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
    redirect(`${basePath}?error=${encodeURIComponent(msg)}&form=open`);
  }

  // Validate that the patient is hospitalized at the scheduled time
  const scheduled = new Date(scheduledAt);
  if (isNaN(scheduled.getTime())) {
    redirect(`${basePath}?error=${encodeURIComponent("Date/heure planifiées invalides")}&form=open`);
  }

  const { data: hospRows, error: hospFetchErr } = await getServiceSupabase()
    .from("hospitalisations")
    .select("id, date_admission, date_sortie_reelle, statut, dossier_patient_id, patient_id")
    .eq("patient_id", patientId);
  if (hospFetchErr) {
    redirect(`${basePath}?error=${encodeURIComponent(hospFetchErr.message)}&form=open`);
  }
  const matchingHosps = (hospRows || []).filter((h: any) => {
    const admitted = new Date(h.date_admission as string);
    const dischargedRaw = h.date_sortie_reelle as string | null;
    const discharged = dischargedRaw ? new Date(dischargedRaw) : null;
    const statut = String(h.statut || "");
    if (isNaN(admitted.getTime())) return false;
    const withinStay = discharged ? scheduled >= admitted && scheduled <= discharged : scheduled >= admitted;
    const statusOk = statut === "en_cours";
    return statusOk && withinStay;
  });
  if (!matchingHosps || matchingHosps.length === 0) {
    const { data: patient } = await getServiceSupabase()
      .from("patients")
      .select("first_name, last_name")
      .eq("id", patientId)
      .maybeSingle();
    const name = patient ? `${patient.last_name ?? ""} ${patient.first_name ?? ""}`.trim() : patientId;
    const when = scheduled.toLocaleString();
    const msg = `Aucune hospitalisation active pour ${name} à ${when}`;
    redirect(`${basePath}?error=${encodeURIComponent(msg)}&form=open`);
  }
  // Choisir l’hospitalisation la plus pertinente (la plus récente avant la date planifiée)
  const selectedHosp = matchingHosps
    .map((h: any) => ({ id: h.id as string, admitted_at: new Date(h.date_admission as string) }))
    .sort((a, b) => b.admitted_at.getTime() - a.admitted_at.getTime())[0];
  let hospitalisationId = selectedHosp?.id;

  // Verify FK target exists (defensive against drift/mismatch)
  if (hospitalisationId) {
    const { data: fkHosp, error: fkHospErr } = await getServiceSupabase()
      .from("hospitalisations")
      .select("id, dossier_patient_id, patient_id")
      .eq("id", hospitalisationId)
      .maybeSingle();
    if (fkHospErr || !fkHosp || !fkHosp.id) {
      redirect(`${basePath}?error=${encodeURIComponent("Hospitalisation introuvable pour l’ID sélectionné")}&form=open`);
    }
    if (fkHosp.patient_id && fkHosp.patient_id !== patientId) {
      redirect(`${basePath}?error=${encodeURIComponent("Hospitalisation et patient ne correspondent pas")}&form=open`);
    }
  }

  // Compute heure_prevue from scheduledAt (NOT NULL in DB)
  const heurePrevue = extractHeurePrevue(scheduledAt);
  const dateDebut = extractDateDebut(scheduledAt);

  const scheduledUtc = toUTCFromLocalInput(scheduledAt) || scheduledAt;
  const payload = {
    patient_id: patientId,
    type_soin: typeSoin || title || "Autre",
    title,
    description: description ?? "",
    scheduled_at: scheduledUtc,
    date_debut: dateDebut,
    heure_prevue: heurePrevue,
    assigned_to_nurse_id: assignedToNurseId ?? null,
    status,
    hospitalisation_id: hospitalisationId,
    created_at: new Date().toISOString(),
  } as const;

  const { error } = await getServiceSupabase().from("soins").insert(payload);
  if (error) {
    redirect(`${basePath}?error=${encodeURIComponent(error.message)}&form=open`);
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
  const { error } = await getServiceSupabase()
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

  const { error } = await getServiceSupabase().from("soins").delete().eq("id", id);
  if (error) {
    redirect(`/infirmiere/soins?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/infirmiere/soins?success=${encodeURIComponent("Soin supprimé")}`);
}

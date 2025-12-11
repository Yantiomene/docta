import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const nurseId = url.searchParams.get("nurse_id") || "";
  if (!date) {
    return NextResponse.json({ error: "Paramètre 'date' requis" }, { status: 400 });
  }
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const supabase = getServiceSupabase();
  let query = supabase
    .from("soins")
    .select("id, title, description, scheduled_at, status, assigned_to_nurse_id, patient_id, patients(first_name, last_name)")
    .eq("status", "scheduled")
    .gte("scheduled_at", dayStart)
    .lte("scheduled_at", dayEnd)
    .order("scheduled_at", { ascending: true });
  if (nurseId) {
    query = query.eq("assigned_to_nurse_id", nurseId);
  }
  const { data: soins, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const rows = soins || [];
  const patientIds = Array.from(new Set(rows.map((r: any) => r.patient_id)));
  const nurseIds = Array.from(new Set(rows.map((r: any) => r.assigned_to_nurse_id).filter(Boolean)));

  const hospIds = Array.from(new Set(rows.map((r: any) => r.hospitalisation_id).filter(Boolean)));
  const { data: hospRows } = await supabase
    .from("hospitalisations")
    .select("id, service, lit, statut, date_admission, date_sortie_reelle")
    .in("id", hospIds);
  const hospMap: Record<string, { ward?: string | null; bed?: string | null }> = {};
  (hospRows || []).forEach((h: any) => {
    const key = h.id as string;
    const prev = hospMap[key];
    const isBetter = !prev || String(h.statut) === "en_cours";
    if (isBetter) hospMap[key] = { ward: h.service ?? null, bed: h.lit ?? null };
  });

  const { data: nurses } = await supabase
    .from("profiles")
    .select("id, nom, prenom")
    .in("id", nurseIds);
  const nurseMap: Record<string, string> = {};
  (nurses || []).forEach((n: any) => {
    nurseMap[n.id] = `${n.nom ?? ""} ${n.prenom ?? ""}`.trim();
  });

  const header = ["patient_name", "title", "description", "scheduled_at", "ward", "bed", "nurse_name"].join(",");
  const lines = rows.map((r: any) => {
    const patientName = `${r.patients?.first_name ?? ""} ${r.patients?.last_name ?? ""}`.trim();
    const h = hospMap[r.hospitalisation_id] || { ward: "", bed: "" };
    const nurseName = r.assigned_to_nurse_id ? nurseMap[r.assigned_to_nurse_id] ?? "" : "";
    const vals = [
      patientName,
      r.title ?? "",
      r.description ?? "",
      r.scheduled_at ?? "",
      h.ward ?? "",
      h.bed ?? "",
      nurseName,
    ].map((v) => {
      const s = String(v ?? "");
      // Escape CSV
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    });
    return vals.join(",");
  });
  const csv = [header, ...lines].join("\n");

  const filename = `soins_${date}${nurseId ? `_${nurseId}` : ""}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}

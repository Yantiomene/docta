import PatientForm from "@/components/features/patients/PatientForm";
import PatientList from "@/components/features/patients/PatientList";
import PatientSearch from "@/components/features/patients/PatientSearch";
import PatientSuggestions from "@/components/features/patients/PatientSuggestions";
import PatientDrawer from "@/components/features/patients/PatientDrawer";
import { getServiceSupabase } from "@/lib/supabaseServer";

export default async function MedecinPatientsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Charger la liste des profils pour associer un dossier
  const { data: profiles } = await getServiceSupabase()
    .from("profiles")
    .select("id, email, nom, prenom, role")
    .order("prenom", { ascending: true })
    .limit(500);

  const q = typeof searchParams?.q === "string" ? String(searchParams.q) : "";
  const pid = typeof searchParams?.pid === "string" ? String(searchParams.pid) : "";
  const success = typeof searchParams?.success === "string" ? String(searchParams.success) : undefined;
  const error = typeof searchParams?.error === "string" ? String(searchParams.error) : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Patients</h1>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>
      )}
      <PatientForm users={profiles || []} />
      <div className="space-y-3">
        <PatientSearch />
        <PatientSuggestions query={q} />
      </div>
      <PatientList query={q || undefined} />
      {pid ? (
        <PatientDrawer
          patientId={pid}
          searchParams={{ success, error, q }}
        />
      ) : null}
    </div>
  );
}

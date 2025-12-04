import PatientForm from "@/components/features/patients/PatientForm";
import PatientList from "@/components/features/patients/PatientList";
import { getServerSupabase } from "@/lib/supabaseServer";

export default async function AdminPatientsPage() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Patients</h1>
        <p className="text-sm text-red-600">Vous devez être connecté.</p>
      </div>
    );
  }

  // Fetch a list of users (profiles) for selection
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, nom, prenom, role")
    .order("prenom", { ascending: true })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Patients</h1>
      <PatientForm users={profiles || []} />
      <PatientList />
    </div>
  );
}

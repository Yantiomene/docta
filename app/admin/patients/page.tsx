import PatientForm from "@/components/features/patients/PatientForm";
import PatientList from "@/components/features/patients/PatientList";
import { getServerSupabase } from "@/lib/supabaseServer";

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
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
      {searchParams?.error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {String(searchParams.error)}
        </div>
      )}
      {searchParams?.success && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {String(searchParams.success)}
        </div>
      )}
      <PatientForm users={profiles || []} />
      <PatientList />
    </div>
  );
}

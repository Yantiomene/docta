import PatientForm from "@/components/features/patients/PatientForm";
import PatientList from "@/components/features/patients/PatientList";
import PatientSearch from "@/components/features/patients/PatientSearch";
import PatientSuggestions from "@/components/features/patients/PatientSuggestions";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

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

  // Guard: only staff can access this page
  // Use service client to bypass any RLS restrictions when reading the role
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = me?.role || "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`/${role}`);
  }

  // Fetch a list of users (profiles) for selection
  // Fetch profiles via service client to avoid RLS blocking admin search
  const { data: profiles } = await getServiceSupabase()
    .from("profiles")
    .select("id, email, nom, prenom, role")
    .order("prenom", { ascending: true })
    .limit(500);

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
      <div className="space-y-3">
        <PatientSearch />
        <PatientSuggestions query={typeof searchParams?.q === "string" ? String(searchParams.q) : ""} />
      </div>
      <PatientList query={typeof searchParams?.q === "string" ? String(searchParams.q) : undefined} />
    </div>
  );
}

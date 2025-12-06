import { getServerSupabase } from "@/lib/supabaseServer";

type PatientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  user_id: string | null;
  managed_by_staff: boolean | null;
  created_at: string;
};

export default async function PatientList({ query }: { query?: string }) {
  const supabase = getServerSupabase();
  const base = supabase
    .from("patients")
    .select(
      "id, first_name, last_name, email, phone, user_id, managed_by_staff, created_at"
    );
  const q = (query || "").trim();
  let req = base;
  if (q) {
    req = req.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  const { data, error } = await req.order("created_at", { ascending: false }).limit(50);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-2">Patients</h3>
      {error ? (
        <p className="text-sm text-red-600">
          Erreur lors du chargement: {error.message}
        </p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-gray-600">Aucun patient trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Nom</th>
                <th className="py-2 pr-2">Contact</th>
                <th className="py-2 pr-2">Utilisateur</th>
                <th className="py-2 pr-2">Géré par staff</th>
                <th className="py-2 pr-2">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p: PatientRow) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-2">
                    <a
                      href={`?pid=${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.last_name} {p.first_name}
                    </a>
                  </td>
                  <td className="py-2 pr-2">
                    {p.email || "—"} / {p.phone || "—"}
                  </td>
                  <td className="py-2 pr-2">{p.user_id ? "lié" : "—"}</td>
                  <td className="py-2 pr-2">
                    {p.managed_by_staff ? "oui" : "non"}
                  </td>
                  <td className="py-2 pr-2">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

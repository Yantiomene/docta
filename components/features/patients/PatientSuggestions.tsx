import { getServerSupabase } from "@/lib/supabaseServer";

type PatientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export default async function PatientSuggestions({ query }: { query: string }) {
  if (!query || !query.trim()) return null;
  const q = query.trim();
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, email")
    .or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
    )
    .order("last_name", { ascending: true })
    .limit(10);

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        Erreur de recherche: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-gray-600">Aucun patient ne correspond.</p>
    );
  }

  return (
    <div className="rounded-md border p-2">
      <p className="text-xs text-muted-foreground mb-1">Suggestions</p>
      <ul className="space-y-1">
        {data.map((p: PatientRow) => (
          <li key={p.id} className="text-sm">
            <a
              href={`?pid=${p.id}`}
              className="text-blue-600 hover:underline"
            >
              {(p.last_name || "") + " " + (p.first_name || "")} {p.email ? `— ${p.email}` : ""}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

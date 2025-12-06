"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Input from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase";

type PatientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export default function PatientAutocomplete({
  name = "patientId",
  label = "Nom du patient",
}: {
  name?: string;
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PatientRow[]>([]);
  const [selected, setSelected] = useState<PatientRow | null>(null);
  const supabase = useMemo(() => getSupabaseClient(), []);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        const { data, error } = await supabase
          .from("patients")
          .select("id, first_name, last_name, email")
          .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
          .order("last_name", { ascending: true })
          .limit(8);
        if (error) {
          console.error("Patient search error", error.message);
          setResults([]);
        } else {
          setResults(data ?? []);
        }
      } catch (e) {
        // ignore aborts
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, supabase]);

  const onPick = (row: PatientRow) => {
    setSelected(row);
    setQuery(`${row.last_name ?? ""} ${row.first_name ?? ""}`.trim());
    setResults([]);
  };

  return (
    <div className="relative">
      {/* Hidden field sent with the form */}
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <label className="text-sm text-foreground">{label}</label>
      <Input
        value={query}
        onChange={(e) => {
          setSelected(null);
          setQuery(e.target.value);
        }}
        placeholder="Saisissez un nom, un prénom ou un email"
        className="mt-1"
      />
      {selected && (
        <p className="mt-1 text-xs text-muted-foreground">
          Sélectionné: {(selected.last_name || "") + " " + (selected.first_name || "")} {selected.email ? `— ${selected.email}` : ""}
        </p>
      )}
      {!selected && (query.trim().length > 0) && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-muted bg-background shadow">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Recherche…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Aucun patient ne correspond.</div>
          ) : (
            <ul className="max-h-56 overflow-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPick(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  >
                    {(p.last_name || "") + " " + (p.first_name || "")} {p.email ? `— ${p.email}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!selected && (
        <p className="mt-1 text-xs text-destructive">Veuillez sélectionner un patient dans la liste.</p>
      )}
    </div>
  );
}


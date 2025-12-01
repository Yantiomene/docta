import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { updateUserRoleAction, setActiveAction } from "@/lib/actions/adminUsers";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import ConfirmRoleChange from "@/components/features/admin/ConfirmRoleChange";

type SearchParams = { error?: string; success?: string; q?: string; role?: string };

export default async function AdminUsersPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.role !== "admin") redirect("/post-login");

  const q = (searchParams?.q || "").trim();
  const filterRole = (searchParams?.role || "").trim();

  let query = supabase
    .from("profiles")
    .select("id, email, nom, prenom, role, telephone, actif, created_at")
    .order("created_at", { ascending: false });

  if (filterRole) {
    query = query.eq("role", filterRole);
  }
  if (q) {
    // Search on nom/prenom/email
    query = query.or(`nom.ilike.%${q}%,prenom.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: profiles, error } = await query;

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  const message = searchParams?.error
    ? { kind: "error" as const, text: searchParams!.error }
    : searchParams?.success
    ? { kind: "success" as const, text: searchParams!.success }
    : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <p className="text-gray-600">View users, update roles. Only admins may change roles.</p>
      {message && (
        <div className={`rounded-md border px-3 py-2 ${message.kind === "error" ? "border-red-300 bg-red-50 text-red-700" : "border-green-300 bg-green-50 text-green-700"}`}>
          {message.text}
        </div>
      )}
      <form method="get" className="flex items-end gap-2">
        <div>
          <label className="text-sm font-medium">Search</label>
          <Input name="q" defaultValue={q} placeholder="name or email" />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <Select name="role" defaultValue={filterRole} className="w-40">
            <option value="">All</option>
            <option value="patient">Patient</option>
            <option value="medecin">Médecin</option>
            <option value="infirmiere">Infirmière</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" onClick={() => { window.location.href = "/admin/users"; }}>Clear</Button>
      </form>

      <div className="overflow-x-auto rounded-lg border mt-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Active</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.nom} {p.prenom}</td>
                <td className="px-3 py-2">{p.email}</td>
                <td className="px-3 py-2">{p.telephone ?? "—"}</td>
                <td className="px-3 py-2">
                  <ConfirmRoleChange userId={p.id} currentRole={p.role} />
                </td>
                <td className="px-3 py-2">{p.actif ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  <form action={setActiveAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="user_id" value={p.id} />
                    <input type="hidden" name="active" value={(!p.actif).toString()} />
                    <Button type="submit" variant="outline">{p.actif ? "Deactivate" : "Activate"}</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

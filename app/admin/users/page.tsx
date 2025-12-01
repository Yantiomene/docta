import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { updateUserRoleAction } from "@/lib/actions/adminUsers";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";

type SearchParams = { error?: string; success?: string };

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

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, nom, prenom, role, telephone, actif")
    .order("created_at", { ascending: false });

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
      <div className="overflow-x-auto rounded-lg border">
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
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={p.id} />
                    <Select name="role" defaultValue={p.role} className="w-40">
                      <option value="patient">Patient</option>
                      <option value="medecin">Médecin</option>
                      <option value="infirmiere">Infirmière</option>
                      <option value="admin">Admin</option>
                    </Select>
                    <Button type="submit" variant="outline">Save</Button>
                  </form>
                </td>
                <td className="px-3 py-2">{p.actif ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  {/* Additional actions like deactivate/reactivate can be added later */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


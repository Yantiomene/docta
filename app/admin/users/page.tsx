import { redirect } from "next/navigation";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import { updateUserRoleAction, setActiveAction } from "@/lib/actions/adminUsers";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import ConfirmRoleChange from "@/components/features/admin/ConfirmRoleChange";

type SearchParams = { error?: string; success?: string; q?: string; role?: string };

export default async function AdminUsersPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = getServerSupabase();
  const admin = getServiceSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/auth/login");

  // Robust role check: prefer reading via service client (avoids RLS recursion),
  // then fall back to user metadata and admin email override if needed.
  let myRole: string | null = null;
  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  // choose role from service read if present, else fallback to metadata
  myRole = me?.role ?? (user.user_metadata?.role as string | undefined) ?? null;
  const isAdmin = myRole === "admin" || (!!ADMIN_EMAIL && user.email === ADMIN_EMAIL);
  if (!isAdmin) redirect("/post-login");

  const q = (searchParams?.q || "").trim();
  const filterRole = (searchParams?.role || "").trim();

  // Use service client for admin listing operations to avoid RLS limitations
  let query = admin
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
      <form method="get" className="grid grid-cols-1 sm:grid-cols-[1fr_12rem_auto_auto] items-end gap-3">
        <div className="sm:col-span-1">
          <label className="text-sm font-medium">Search</label>
          <Input name="q" defaultValue={q} placeholder="name or email" />
        </div>
        <div className="sm:col-span-1">
          <label className="text-sm font-medium">Role</label>
          <Select name="role" defaultValue={filterRole} className="w-full sm:w-40">
            <option value="">All</option>
            <option value="patient">Patient</option>
            <option value="medecin">Médecin</option>
            <option value="infirmiere">Infirmière</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <Button type="submit" className="sm:col-span-1">Apply</Button>
        <a href="/admin/users" className="inline-flex h-9 items-center rounded-md border border-muted px-3 text-sm hover:bg-muted sm:col-span-1">Clear</a>
      </form>

      <div className="overflow-x-auto rounded-lg border mt-4">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2 whitespace-nowrap">Name</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">Email</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">Phone</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">Role</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">Active</th>
              <th className="text-left px-3 py-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 break-words max-w-[12rem] truncate sm:whitespace-normal sm:overflow-visible sm:text-clip sm:max-w-none">{p.nom} {p.prenom}</td>
                <td className="px-3 py-2 break-words max-w-[18rem] truncate sm:whitespace-normal sm:overflow-visible sm:text-clip sm:max-w-none">{p.email}</td>
                <td className="px-3 py-2 break-words max-w-[10rem] truncate sm:whitespace-normal sm:overflow-visible sm:text-clip sm:max-w-none">{p.telephone ?? "—"}</td>
                <td className="px-3 py-2">
                  <ConfirmRoleChange userId={p.id} currentRole={p.role} />
                </td>
                <td className="px-3 py-2">{p.actif ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  <form action={setActiveAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="user_id" value={p.id} />
                    <input type="hidden" name="active" value={(!!(!p.actif)).toString()} />
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

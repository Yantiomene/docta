"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";

const VALID_ROLES = new Set(["admin", "medecin", "infirmiere", "patient"]);

export async function updateUserRoleAction(formData: FormData) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();
  if (me?.role !== "admin") redirect("/post-login");

  const targetUserId = (formData.get("user_id") || "").toString();
  const newRole = (formData.get("role") || "").toString();

  if (!targetUserId || !VALID_ROLES.has(newRole)) {
    redirect(`/admin/users?error=${encodeURIComponent("Invalid payload")}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/users?success=${encodeURIComponent("Role updated")}`);
}


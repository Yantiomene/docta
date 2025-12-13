"use server";

import { redirect } from "next/navigation";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";

const VALID_ROLES = new Set(["admin", "medecin", "infirmiere", "patient"]);

export async function updateUserRoleAction(formData: FormData) {
  const supabase = getServerSupabase();
  const admin = getServiceSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  // Check role via service client to avoid RLS recursion; fallback to metadata
  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const myRole = me?.role ?? (currentUser.user_metadata?.role as string | undefined) ?? null;
  const isAdmin = myRole === "admin" || (!!ADMIN_EMAIL && currentUser.email === ADMIN_EMAIL);
  if (!isAdmin) redirect("/post-login");

  const targetUserId = (formData.get("user_id") || "").toString();
  const newRole = (formData.get("role") || "").toString();

  if (!targetUserId || !VALID_ROLES.has(newRole)) {
    redirect(`/admin/users?error=${encodeURIComponent("Invalid payload")}`);
  }

  // Perform update with service client to ensure admin privileges
  const { error } = await admin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  await admin.auth.admin.updateUserById(targetUserId, {
    user_metadata: { role: newRole },
    app_metadata: { role: newRole },
  });

  redirect(`/admin/users?success=${encodeURIComponent("Role updated")}`);
}

export async function setActiveAction(formData: FormData) {
  const supabase = getServerSupabase();
  const admin = getServiceSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user;
  if (!currentUser) redirect("/auth/login");

  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const myRole = me?.role ?? (currentUser.user_metadata?.role as string | undefined) ?? null;
  const isAdmin = myRole === "admin" || (!!ADMIN_EMAIL && currentUser.email === ADMIN_EMAIL);
  if (!isAdmin) redirect("/post-login");

  const targetUserId = (formData.get("user_id") || "").toString();
  const activeRaw = (formData.get("active") || "").toString();
  const active = activeRaw === "true";
  if (!targetUserId) {
    redirect(`/admin/users?error=${encodeURIComponent("Invalid payload")}`);
  }

  const { error } = await admin
    .from("profiles")
    .update({ actif: active })
    .eq("id", targetUserId);
  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/users?success=${encodeURIComponent("Status updated")}`);
}

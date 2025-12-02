import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";

export default async function PostLoginPage() {
  const supabase = getServerSupabase();
  const admin = getServiceSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  // Read profile using service-role client to avoid RLS recursion blocking own profile
  const { data: profile, error } = await admin
    .from("profiles")
    .select("role, nom, prenom")
    .eq("id", user.id)
    .maybeSingle();

  // If profile not found or incomplete, send to setup
  if (!profile) {
    redirect("/profile/setup");
  }

  if (!profile || !profile.nom || !profile.prenom) {
    redirect("/profile/setup");
  }

  const role = profile.role || "patient";
  redirect(`/${role}`);
}

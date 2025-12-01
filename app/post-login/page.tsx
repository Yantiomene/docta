import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSupabase } from "@/lib/supabaseServer";

export default async function PostLoginPage() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, nom, prenom")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    // If there's an error reading profile, send to setup to recover
    redirect("/profile/setup");
  }

  if (!profile || !profile.nom || !profile.prenom) {
    redirect("/profile/setup");
  }

  const role = profile.role || "patient";
  cookies().set({ name: "role", value: role, path: "/" });
  redirect(`/${role}`);
}

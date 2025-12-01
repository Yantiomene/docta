import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { updatePreferencesAction } from "@/lib/actions/preferences";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default async function PreferencesPage() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, specialite, service")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || "patient";
  if (!["admin", "medecin", "infirmiere"].includes(role)) {
    redirect(`/${role}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Préférences utilisateur</h1>
        <p className="text-sm text-gray-600">Spécialité et service sont réservés aux rôles: admin, médecin, infirmière.</p>
        <form action={updatePreferencesAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Spécialité</label>
            <Input name="specialite" defaultValue={profile?.specialite ?? ""} />
          </div>
          <div>
            <label className="text-sm font-medium">Service</label>
            <Input name="service" defaultValue={profile?.service ?? ""} />
          </div>
          <Button type="submit" className="w-full">Enregistrer</Button>
        </form>
      </div>
    </div>
  );
}


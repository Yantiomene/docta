import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { upsertProfileAction } from "@/lib/actions/profile";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default async function ProfileSetupPage() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Compléter votre profil</h1>
        <form action={upsertProfileAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input name="nom" required />
          </div>
          <div>
            <label className="text-sm font-medium">Prénom</label>
            <Input name="prenom" required />
          </div>
          <div>
            <label className="text-sm font-medium">Téléphone (optionnel)</label>
            <Input name="telephone" />
          </div>
          <div>
            <label className="text-sm font-medium">Spécialité (optionnel)</label>
            <Input name="specialite" />
          </div>
          <div>
            <label className="text-sm font-medium">Service (optionnel)</label>
            <Input name="service" />
          </div>
          <div>
            <label className="text-sm font-medium">Avatar URL (optionnel)</label>
            <Input name="avatar_url" />
          </div>
          <Button type="submit" className="w-full">Enregistrer</Button>
        </form>
      </div>
    </div>
  );
}

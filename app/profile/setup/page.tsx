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
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone (avec indicatif pays, optionnel)</label>
            <div className="flex gap-2">
              <select name="country_code" className="rounded-md border px-3 py-2">
                <option value="33">+33 (France)</option>
                <option value="32">+32 (Belgique)</option>
                <option value="41">+41 (Suisse)</option>
                <option value="1">+1 (USA/Canada)</option>
                <option value="44">+44 (UK)</option>
              </select>
              <Input
                name="phone_number"
                placeholder="Numéro sans 0 initial"
                inputMode="numeric"
                pattern="[0-9]+"
              />
            </div>
            <p className="text-xs text-gray-500">Ex: +33 612345678 ⇒ code 33, numéro 612345678</p>
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

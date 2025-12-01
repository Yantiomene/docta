import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { upsertProfileAction } from "@/lib/actions/profile";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default async function ProfileSetupPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  const error = (searchParams?.error as string | undefined) || undefined;
  const phoneError = error === "missing_phone"
    ? "Le téléphone est requis."
    : error === "invalid_phone"
      ? "Numéro invalide. Utilisez le format E.164 (ex: +33612345678)."
      : undefined;

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
            <label className="text-sm font-medium">Téléphone (indicatif pays + numéro, requis)</label>
            <div className="flex gap-2">
              <select name="country_code" className="rounded-md border px-3 py-2" required defaultValue="33">
                <option value="">Sélectionner</option>
                <option value="33">+33 (France)</option>
                <option value="32">+32 (Belgique)</option>
                <option value="41">+41 (Suisse)</option>
                <option value="352">+352 (Luxembourg)</option>
                <option value="377">+377 (Monaco)</option>
                <option value="49">+49 (Allemagne)</option>
                <option value="39">+39 (Italie)</option>
                <option value="34">+34 (Espagne)</option>
                <option value="44">+44 (Royaume-Uni)</option>
                <option value="1">+1 (USA/Canada)</option>
                <option value="213">+213 (Algérie)</option>
                <option value="212">+212 (Maroc)</option>
                <option value="216">+216 (Tunisie)</option>
                <option value="221">+221 (Sénégal)</option>
                <option value="225">+225 (Côte d’Ivoire)</option>
                <option value="237">+237 (Cameroun)</option>
                <option value="234">+234 (Nigeria)</option>
              </select>
              <Input
                name="phone_number"
                placeholder="Numéro sans 0 initial"
                inputMode="numeric"
                pattern="[0-9]+"
                required
                aria-invalid={phoneError ? true : undefined}
              />
            </div>
            {phoneError && (
              <p className="text-xs text-red-600">{phoneError}</p>
            )}
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

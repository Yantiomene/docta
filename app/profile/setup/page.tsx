import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { upsertProfileAction } from "@/lib/actions/profile";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import PhoneFields from "@/components/features/profile/PhoneFields";

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
          <PhoneFields initialCountryIso="FR" serverError={phoneError} />
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

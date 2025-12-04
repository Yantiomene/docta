import { getServerSupabase } from "@/lib/supabaseServer";
import { upsertSelfPatientAction } from "@/lib/actions/patients";
import { redirect } from "next/navigation";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";

export default async function PatientDossierPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  const successMessage = searchParams?.success;
  const errorMessage = searchParams?.error;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Mon dossier patient</h1>
        <p className="text-gray-600">Créez ou mettez à jour votre dossier.</p>
      </div>

      {successMessage && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <form action={upsertSelfPatientAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Prénom</label>
            <Input name="firstName" placeholder="Votre prénom" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <Input name="lastName" placeholder="Votre nom" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input type="email" name="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium">Téléphone</label>
            <Input name="phone" placeholder="+33..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Date de naissance</label>
            <Input type="date" name="dob" />
          </div>
          <div>
            <label className="block text-sm font-medium">Genre</label>
            <Select name="gender" required defaultValue="">
              <option value="" disabled>
                Sélectionner
              </option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium">Groupe sanguin (optionnel)</label>
            <Select name="bloodType" defaultValue="">
              <option value="">Non spécifié</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Enregistrer mon dossier</Button>
        </div>
      </form>
    </div>
  );
}

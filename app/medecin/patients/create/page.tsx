import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabaseServer";
import { createPatientAction } from "@/lib/actions/patients";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";

export default async function CreatePatientPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  const error = (searchParams?.error as string | undefined) || undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Créer un dossier patient</h1>
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form action={createPatientAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Prénom</label>
            <Input name="firstName" required />
          </div>
          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input name="lastName" required />
          </div>
          <div>
            <label className="text-sm font-medium">Email (optionnel)</label>
            <Input type="email" name="email" />
          </div>
          <div>
            <label className="text-sm font-medium">Téléphone (optionnel)</label>
            <Input name="phone" />
          </div>
          <div>
            <label className="text-sm font-medium">Date de naissance (optionnel)</label>
            <Input type="date" name="dob" />
          </div>
          <div>
            <label className="text-sm font-medium">Genre</label>
            <Select name="gender" required className="w-full">
              <option value="">Sélectionner</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Groupe sanguin (optionnel)</label>
            <Select name="bloodType" className="w-full">
              <option value="">Sélectionner</option>
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
          <Button type="submit" className="w-full">Créer</Button>
        </form>
      </div>
    </div>
  );
}

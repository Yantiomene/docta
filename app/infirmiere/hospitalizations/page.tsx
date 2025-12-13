import HospitalizationForm from "@/components/features/hospitalizations/HospitalizationForm";
import HospitalizationList from "@/components/features/hospitalizations/HospitalizationList";
import TogglePanel from "@/components/features/common/TogglePanel";

export default function InfirmiereHospitalizationsPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string; ts?: string; form?: string };
}) {
  const success = searchParams?.success;
  const error = searchParams?.error;
  const ts = searchParams?.ts;
  const formOpen = String(searchParams?.form || "") === "open";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Hospitalisations</h1>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 text-destructive px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-600 bg-green-600/10 text-green-700 dark:text-green-300 px-3 py-2 text-sm">
          {success}
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-2">Nouvelle hospitalisation</h2>
        <TogglePanel buttonLabel="Créer une hospitalisation" defaultOpen={formOpen}>
          <HospitalizationForm key={ts ?? "form"} />
        </TogglePanel>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Liste des hospitalisations</h2>
        <HospitalizationList />
      </div>
    </div>
  );
}

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createHospitalizationAction } from "@/lib/actions/hospitalizations";
import PatientAutocomplete from "@/components/features/patients/PatientAutocomplete";

export default function HospitalizationForm() {
  return (
    <form action={createHospitalizationAction} className="space-y-3">
      <PatientAutocomplete name="patientId" label="Nom du patient" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-foreground">Service</label>
          <Input name="ward" />
        </div>
        <div>
          <label className="text-sm text-foreground">Chambre</label>
          <Input name="room" />
        </div>
        <div>
          <label className="text-sm text-foreground">Lit</label>
          <Input name="bed" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-foreground">Date d’admission</label>
          <Input type="datetime-local" name="admittedAt" required />
        </div>
        <div>
          <label className="text-sm text-foreground">Statut</label>
          <Input name="status" defaultValue="active" />
        </div>
      </div>
      <Button type="submit">Créer l'hospitalisation</Button>
    </form>
  );
}

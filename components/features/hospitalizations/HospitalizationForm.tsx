import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { createHospitalizationAction } from "@/lib/actions/hospitalizations";
import PatientAutocomplete from "@/components/features/patients/PatientAutocomplete";

export default function HospitalizationForm() {
  return (
    <form action={createHospitalizationAction} className="space-y-3">
      <PatientAutocomplete name="patientId" label="Nom du patient" requireLinkedProfile />
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
          <label className="text-sm text-foreground">Date de sortie</label>
          <Input type="datetime-local" name="dischargedAt" />
        </div>
      </div>
      <div>
        <label className="text-sm text-foreground">Statut</label>
        <Select name="status" defaultValue="active">
          <option value="active">Actif</option>
          <option value="discharged">Sortie</option>
        </Select>
      </div>
      <Button type="submit">Créer l'hospitalisation</Button>
      <p className="text-xs text-muted-foreground">
        Remarque: sélectionnez un patient lié à un compte utilisateur. Pour lier un patient, utilisez la page Administration &gt; Patients.
      </p>
    </form>
  );
}

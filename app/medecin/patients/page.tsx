import PatientList from "@/components/features/patients/PatientList";

export default function MedecinPatientsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Patients</h1>
      <PatientList />
    </div>
  );
}


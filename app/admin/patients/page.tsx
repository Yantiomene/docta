import PatientForm from "@/components/features/patients/PatientForm";
import PatientList from "@/components/features/patients/PatientList";

export default function AdminPatientsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Patients</h1>
      <PatientForm />
      <PatientList />
    </div>
  );
}


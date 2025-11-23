import HospitalizationForm from "@/components/features/hospitalizations/HospitalizationForm";

export default function AdminHospitalizationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Hospitalizations</h1>
      <HospitalizationForm />
    </div>
  );
}


import AppointmentForm from "@/components/features/appointments/AppointmentForm";

export default function PatientAppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Appointments</h1>
      <AppointmentForm />
    </div>
  );
}


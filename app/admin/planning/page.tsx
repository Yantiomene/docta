import ShiftForm from "@/components/features/planning/ShiftForm";
import ShiftList from "@/components/features/planning/ShiftList";

export default function AdminPlanningPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Planning</h1>
      <ShiftForm />
      <ShiftList />
    </div>
  );
}


import { createPatientAction } from "@/lib/actions/patients";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

export default function PatientForm() {
  return (
    <form action={createPatientAction} className="space-y-3">
      <div>
        <label className="text-sm">First name</label>
        <Input name="firstName" required />
      </div>
      <div>
        <label className="text-sm">Last name</label>
        <Input name="lastName" required />
      </div>
      <div>
        <label className="text-sm">Email (optional)</label>
        <Input type="email" name="email" />
      </div>
      <div>
        <label className="text-sm">Phone (optional)</label>
        <Input name="phone" />
      </div>
      <div>
        <label className="text-sm">Date of birth (optional)</label>
        <Input type="date" name="dob" />
      </div>
      <div>
        <label className="text-sm">Gender</label>
        <Select name="gender" required className="w-full">
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div>
        <label className="text-sm">Blood Type (optional)</label>
        <Select name="bloodType" className="w-full">
          <option value="">Select</option>
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
      <Button type="submit">Save Patient</Button>
    </form>
  );
}

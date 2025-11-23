"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientSchema } from "@/lib/schemas";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type FormData = z.infer<typeof PatientSchema>;

export default function PatientForm() {
  const form = useForm<FormData>({ resolver: zodResolver(PatientSchema), defaultValues: { firstName: "", lastName: "" } });

  function onSubmit(values: FormData) {
    // placeholder submit; wire to API later
    console.log("create patient", values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">First name</label>
        <Input {...form.register("firstName")} />
      </div>
      <div>
        <label className="text-sm">Last name</label>
        <Input {...form.register("lastName")} />
      </div>
      <div>
        <label className="text-sm">Email</label>
        <Input type="email" {...form.register("email")} />
      </div>
      <Button type="submit">Save Patient</Button>
    </form>
  );
}


"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentSchema } from "@/lib/schemas";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type FormData = z.infer<typeof AppointmentSchema>;

export default function AppointmentForm() {
  const form = useForm<FormData>({ resolver: zodResolver(AppointmentSchema) });
  function onSubmit(values: FormData) { console.log("create appointment", values); }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">Patient ID</label>
        <Input {...form.register("patientId")} />
      </div>
      <div>
        <label className="text-sm">Médecin ID</label>
        <Input {...form.register("medecinId")} />
      </div>
      <div>
        <label className="text-sm">Starts At</label>
        <Input type="datetime-local" {...form.register("startsAt")} />
      </div>
      <Button type="submit">Book Appointment</Button>
    </form>
  );
}


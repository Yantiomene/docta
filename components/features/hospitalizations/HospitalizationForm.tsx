"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HospitalizationSchema } from "@/lib/schemas";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type FormData = z.infer<typeof HospitalizationSchema>;

export default function HospitalizationForm() {
  const form = useForm<FormData>({ resolver: zodResolver(HospitalizationSchema) });
  function onSubmit(values: FormData) { console.log("create hospitalization", values); }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">Patient ID</label>
        <Input {...form.register("patientId")} />
      </div>
      <div>
        <label className="text-sm">Ward</label>
        <Input {...form.register("ward")} />
      </div>
      <div>
        <label className="text-sm">Admitted At</label>
        <Input type="datetime-local" {...form.register("admittedAt")} />
      </div>
      <Button type="submit">Save Hospitalization</Button>
    </form>
  );
}


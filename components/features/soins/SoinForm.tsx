"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SoinSchema } from "@/lib/schemas";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";

type FormData = z.infer<typeof SoinSchema>;

export default function SoinForm() {
  const form = useForm<FormData>({ resolver: zodResolver(SoinSchema) });
  function onSubmit(values: FormData) { console.log("create soin", values); }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">Patient ID</label>
        <Input {...form.register("patientId")} />
      </div>
      <div>
        <label className="text-sm">Title</label>
        <Input {...form.register("title")} />
      </div>
      <div>
        <label className="text-sm">Description</label>
        <Textarea rows={3} {...form.register("description")} />
      </div>
      <Button type="submit">Schedule Soin</Button>
    </form>
  );
}


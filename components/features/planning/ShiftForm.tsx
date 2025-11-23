"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShiftSchema } from "@/lib/schemas";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type FormData = z.infer<typeof ShiftSchema>;

export default function ShiftForm() {
  const form = useForm<FormData>({ resolver: zodResolver(ShiftSchema) });
  function onSubmit(values: FormData) { console.log("create shift", values); }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">User ID</label>
        <Input {...form.register("userId")} />
      </div>
      <div>
        <label className="text-sm">Role</label>
        <Input {...form.register("role")} />
      </div>
      <div>
        <label className="text-sm">Starts At</label>
        <Input type="datetime-local" {...form.register("startsAt")} />
      </div>
      <div>
        <label className="text-sm">Ends At</label>
        <Input type="datetime-local" {...form.register("endsAt")} />
      </div>
      <Button type="submit">Save Shift</Button>
    </form>
  );
}


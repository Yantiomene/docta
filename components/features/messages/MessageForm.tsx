"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSchema } from "@/lib/schemas";
import Button from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import Input from "@/components/ui/input";

type FormData = z.infer<typeof MessageSchema>;

export default function MessageForm() {
  const form = useForm<FormData>({ resolver: zodResolver(MessageSchema) });
  function onSubmit(values: FormData) { console.log("send message", values); }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">Recipient ID</label>
        <Input {...form.register("recipientId")} />
      </div>
      <div>
        <label className="text-sm">Message</label>
        <Textarea rows={4} {...form.register("body")} />
      </div>
      <Button type="submit">Send</Button>
    </form>
  );
}


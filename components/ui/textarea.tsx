import type { TextareaHTMLAttributes } from "react";

export default function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-md border border-muted px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary outline-none ${className}`} />;
}

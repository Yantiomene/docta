import type { SelectHTMLAttributes } from "react";

export default function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`w-full rounded-md border border-muted px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary outline-none ${className}`}>
      {children}
    </select>
  );
}

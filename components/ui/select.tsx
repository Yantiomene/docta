import type { SelectHTMLAttributes } from "react";

export default function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`w-full rounded-md border px-3 py-2 ${className}`}>
      {children}
    </select>
  );
}


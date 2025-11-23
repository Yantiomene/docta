import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export default function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
  const styles = variant === "outline" ? "border border-gray-300 hover:bg-gray-50" : "bg-black text-white hover:bg-black/80";
  return <button {...props} className={`${base} ${styles} px-3 py-2 ${className}`} />;
}


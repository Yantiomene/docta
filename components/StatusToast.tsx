"use client";
import { useEffect, useState } from "react";

export default function StatusToast({ message }: { message: { kind: "error" | "success"; text: string } | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (message) {
      setOpen(true);
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    } else {
      setOpen(false);
    }
  }, [message]);

  if (!open || !message) return null;

  const base = "fixed right-4 top-4 z-50 rounded-md border px-4 py-3 shadow-lg";
  const theme = message.kind === "error"
    ? "border-red-300 bg-red-50 text-red-700"
    : "border-green-300 bg-green-50 text-green-700";

  return (
    <div className={`${base} ${theme}`} role="alert" onClick={() => setOpen(false)}>
      {message.text}
    </div>
  );
}


"use client";

import { useState } from "react";
import Button from "@/components/ui/button";

type Props = {
  buttonLabel: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function TogglePanel({ buttonLabel, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen((v) => !v)}>{open ? "Fermer" : buttonLabel}</Button>
      {open ? <div className="rounded-md border p-3">{children}</div> : null}
    </div>
  );
}


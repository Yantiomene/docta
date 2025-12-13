"use client";

import Button from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  buttonLabel: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  paramKey?: string;
};

export default function TogglePanel({ buttonLabel, children, defaultOpen = false, paramKey = "form" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const isOpenFromUrl = sp.get(paramKey) === "open";
  const open = isOpenFromUrl || defaultOpen;

  function toggle() {
    const params = new URLSearchParams(sp.toString());
    if (open) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, "open");
    }
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="space-y-3">
      <Button onClick={toggle}>{open ? "Fermer" : buttonLabel}</Button>
      {open ? <div className="rounded-md border p-3">{children}</div> : null}
    </div>
  );
}

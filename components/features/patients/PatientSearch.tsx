"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/input";

export default function PatientSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const debounced = useMemo(() => {
    let timer: any;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const params = new URLSearchParams(sp.toString());
        if (value.trim()) params.set("q", value.trim());
        else params.delete("q");
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }, 250);
    };
  }, [router, pathname, sp, startTransition]);

  useEffect(() => {
    debounced(query);
  }, [query, debounced]);

  return (
    <div>
      <label className="text-sm">Rechercher un patient (nom/email)</label>
      <Input
        type="text"
        placeholder="Tapez pour filtrer…"
        value={query}
        autoComplete="off"
        onChange={(e: any) => setQuery(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      />
      {isPending && (
        <p className="text-xs text-gray-500 mt-1">Recherche…</p>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";

type Props = {
  isAuthenticatedServer: boolean;
  basePath?: string | null;
};

export default function AuthAwareCTA({ isAuthenticatedServer, basePath }: Props) {
  const [isAuthenticatedClient, setIsAuthenticatedClient] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();
    // Quick client-side session check to avoid SSR latency right after login
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data?.user) setIsAuthenticatedClient(true);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const isAuthenticated = isAuthenticatedServer || isAuthenticatedClient;
  const href = isAuthenticated ? (basePath ?? "/post-login") : "/auth/login";

  return (
    <Link href={href}>
      <Button className="px-5 py-2">Accéder à mon espace</Button>
    </Link>
  );
}


import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  client = createBrowserClient(url, anon, {
    cookies: {
      get(name: string) {
        if (typeof document === "undefined") return undefined;
        const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
        return match ? decodeURIComponent(match[1]) : undefined;
      },
      set(name: string, value: string, options: any = {}) {
        if (typeof document === "undefined") return;
        const opts = { path: "/", ...options };
        let cookie = `${name}=${encodeURIComponent(value)}; path=${opts.path}`;
        if (opts.maxAge) cookie += `; max-age=${opts.maxAge}`;
        if (opts.domain) cookie += `; domain=${opts.domain}`;
        if (opts.sameSite) cookie += `; samesite=${opts.sameSite}`;
        if (opts.secure) cookie += `; secure`;
        document.cookie = cookie;
      },
      remove(name: string, options: any = {}) {
        if (typeof document === "undefined") return;
        const opts = { path: "/", ...options };
        document.cookie = `${name}=; path=${opts.path}; max-age=0`;
      },
    },
  });
  return client;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

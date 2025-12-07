import { cookies } from "next/headers";
import { RolePaths } from "@/lib/rbac";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import RoleLanding from "@/components/features/common/RoleLanding";
import type { Role } from "@/lib/types";

export default async function Home() {
  const supabase = getServerSupabase();
  const hasService = !!process.env.SUPABASE_SECRET_KEY;
  const admin = hasService ? getServiceSupabase() : null;
  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;
  // Résolution robuste du rôle
  let role: Role | undefined;
  const userId = user?.id;
  if (userId) {
    // 1) Essayer via metadata
    role = (user?.user_metadata?.role as Role | undefined) || undefined;
    // 2) Lire le profil via service si dispo, sinon via supabase SSR (RLS doit autoriser la lecture de son propre profil)
    if (!role) {
      if (admin) {
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        role = (profile?.role as Role | undefined) || undefined;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        role = (profile?.role as Role | undefined) || undefined;
      }
    }
  }

  // 3) Fallback cookie uniquement si authentifié mais profil non résolu
  if (!role && userId) {
    const cookieRole = cookies().get("role")?.value as Role | undefined;
    role = cookieRole;
  }

  const basePath = role && RolePaths[role] ? `/${RolePaths[role]}` : undefined;

  return <RoleLanding role={role ?? null} basePath={basePath ?? null} showQuickAccess={false} />;
}

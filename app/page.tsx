import { cookies } from "next/headers";
import { RolePaths } from "@/lib/rbac";
import { getServerSupabase } from "@/lib/supabaseServer";
import RoleLanding from "@/components/features/common/RoleLanding";
import type { Role } from "@/lib/types";

export default async function Home() {
  const supabase = getServerSupabase();
  const { data } = await supabase.auth.getUser();
  const cookieRole = cookies().get("role")?.value as Role | undefined;
  const metaRole = (data.user?.user_metadata?.role as Role | undefined) || undefined;
  let role: Role | undefined = metaRole || cookieRole || undefined;
  if (!role && data.user?.id) {
    // Déduire le rôle depuis la table profiles si disponible
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    const dbRole = (profile?.role as Role | undefined) || undefined;
    role = dbRole || role;
  }
  const basePath = role ? `/${RolePaths[role]}` : undefined;

  return <RoleLanding role={role ?? null} basePath={basePath ?? null} showQuickAccess={false} />;
}

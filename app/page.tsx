import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RolePaths } from "@/lib/rbac";

export default function Home() {
  const role = cookies().get("role")?.value;

  if (role && role in RolePaths) {
    const path = RolePaths[role as keyof typeof RolePaths];
    redirect(`/${path}`);
  }

  redirect("/auth/login");
}

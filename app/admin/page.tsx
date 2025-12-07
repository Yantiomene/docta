import RoleLanding from "@/components/features/common/RoleLanding";

export default async function AdminPage() {
  return <RoleLanding role="admin" basePath="/admin" showHero={false} />;
}

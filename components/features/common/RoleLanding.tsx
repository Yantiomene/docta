import Link from "next/link";
import { getServerSupabase } from "@/lib/supabaseServer";
import type { Role } from "@/lib/types";
import Button from "@/components/ui/button";

// Server Component: unified landing for all roles
export default async function RoleLanding({ role, basePath, showQuickAccess = true }: { role?: Role | null; basePath?: string | null; showQuickAccess?: boolean }): Promise<JSX.Element> {
  const supabase = getServerSupabase();

  async function safeCount(table: string) {
    try {
      const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
      if (error) return null;
      return typeof count === "number" ? count : null;
    } catch {
      return null;
    }
  }

  const [patientsCount, hospCount, soinsCount, apptCount, notifCount] = await Promise.all([
    safeCount("patients"),
    safeCount("hospitalizations"),
    safeCount("soins"),
    safeCount("appointments"),
    safeCount("notifications"),
  ]);

  const isPatient = role === "patient";
  const isLoggedIn = !!role;

  // Map links by role while keeping identical layout
  const links = !isLoggedIn || !basePath
    ? []
    : [
        isPatient
          ? { title: "Dossier", href: `${basePath}/dossier`, desc: "Votre dossier médical" }
          : { title: "Patients", href: `${basePath}/patients`, desc: "Gestion des dossiers patients" },
        { title: "Rendez-vous", href: `${basePath}/appointments`, desc: "Planifier et suivre les visites" },
        { title: "Messages", href: `${basePath}/messages`, desc: "Communication et échanges" },
        { title: "Notifications", href: `${basePath}/notifications`, desc: "Alertes et rappels" },
        ...(isPatient
          ? []
          : [
              { title: "Hospitalisations", href: `${basePath}/hospitalizations`, desc: "Admissions et sorties" },
              { title: "Soins", href: `${basePath}/soins`, desc: "Planification des traitements" },
              { title: "Planning", href: `${basePath}/planning`, desc: "Organisation des équipes" },
            ]),
      ];

  const Stat = ({ label, value }: { label: string; value: number | null }) => (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value ?? "–"}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-10 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Docta — Simplifiez vos soins au quotidien</h1>
          <p className="text-lg text-gray-800">
            Centralisez vos dossiers, planifiez vos rendez-vous, coordonnez les soins et communiquez efficacement. Docta
            accompagne patients et équipes médicales avec une interface moderne et unifiée.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            {isLoggedIn ? (
              <Link href={basePath ?? "/post-login"}>
                <Button className="px-5 py-2">Accéder à mon espace</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button className="px-5 py-2">Accéder à mon espace</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {!role && (
        <section>
          <h2 className="text-lg font-semibold mb-3">En chiffres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Patients" value={patientsCount} />
            <Stat label="Rendez-vous" value={apptCount} />
            <Stat label="Notifications" value={notifCount} />
          </div>
        </section>
      )}

      {role && !isPatient && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Aperçu</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Patients" value={patientsCount} />
            <Stat label="Hospitalisations" value={hospCount} />
            <Stat label="Soins" value={soinsCount} />
            <Stat label="Rendez-vous" value={apptCount} />
            <Stat label="Notifications" value={notifCount} />
          </div>
        </section>
      )}

      {role && isPatient && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Aperçu personnel</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Rendez-vous" value={apptCount} />
            <Stat label="Messages" value={null} />
            <Stat label="Notifications" value={notifCount} />
          </div>
        </section>
      )}

      {showQuickAccess && isLoggedIn && basePath && links.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Accès rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg border p-4 hover:bg-gray-50">
                <div className="font-semibold">{l.title}</div>
                <div className="text-sm text-gray-600">{l.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

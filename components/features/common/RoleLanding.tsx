import Link from "next/link";
import { getServerSupabase } from "@/lib/supabaseServer";
import type { Role } from "@/lib/types";

// Server Component: unified landing for all roles
export default async function RoleLanding({ role, basePath }: { role: Role; basePath: string }) {
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

  // Map links by role while keeping identical layout
  const links = [
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
      <section className="rounded-lg border p-6 bg-white">
        <h1 className="text-2xl font-bold">Bienvenue sur Docta</h1>
        <p className="mt-2 text-gray-700">
          Plateforme unifiée de gestion des soins, dossiers et rendez-vous. Cette page d’accueil est identique pour tous les
          rôles et propose des accès rapides vers les principales fonctionnalités.
        </p>
      </section>

      {!isPatient && (
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

      {isPatient && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Aperçu personnel</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Rendez-vous" value={apptCount} />
            <Stat label="Messages" value={null} />
            <Stat label="Notifications" value={notifCount} />
          </div>
        </section>
      )}

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
    </div>
  );
}


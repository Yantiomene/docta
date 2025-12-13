import SoinForm from "@/components/features/soins/SoinForm";
import SoinList from "@/components/features/soins/SoinList";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import StatusToast from "@/components/StatusToast";

export default function InfirmiereSoinsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const normalizeText = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v.join(", ") : (v ?? "");
  const message = searchParams?.error
    ? { kind: "error" as const, text: normalizeText(searchParams.error) }
    : searchParams?.success
    ? { kind: "success" as const, text: normalizeText(searchParams.success) }
    : null;
  const start = searchParams?.start ? String(searchParams.start) : "";
  const end = searchParams?.end ? String(searchParams.end) : "";
  const q = searchParams?.q ? String(searchParams.q) : "";
  const show = searchParams?.show ? String(searchParams.show) : "";
  const basePath = "/infirmiere/soins";

  const mkHref = (nextShow?: string, form?: "open" | "closed") => {
    const sp = new URLSearchParams();
    if (start) sp.set("start", start);
    if (end) sp.set("end", end);
    if (q) sp.set("q", q);
    if (nextShow) sp.set("show", nextShow);
    if (form) sp.set("form", form);
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Soins</h1>
      {message && (
        <div className={`rounded-md border px-3 py-2 ${message.kind === "error" ? "border-red-300 bg-red-50 text-red-700" : "border-green-300 bg-green-50 text-green-700"}`}>
          {message.text}
        </div>
      )}
      <StatusToast message={message} />
      <div className="flex flex-wrap gap-2">
        <a href={mkHref("create", "open")} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition bg-primary text-white hover:bg-primary/90 px-3 py-2">Créer un soin</a>
        {show && (
          <a href={mkHref(undefined, "closed")} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition border border-muted text-foreground hover:bg-muted px-3 py-2">Fermer le formulaire</a>
        )}
      </div>
      {(show === "create" || String(searchParams?.form || "") === "open") && <SoinForm />}
      <div className="rounded-lg border p-3">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm">Du</label>
            <Input type="date" name="start" defaultValue={start} />
          </div>
          <div>
            <label className="text-sm">Au</label>
            <Input type="date" name="end" defaultValue={end} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm">Recherche</label>
            <Input type="text" name="q" defaultValue={q} placeholder="Patient, titre..." />
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit">Filtrer</Button>
          </div>
        </form>
      </div>
      <SoinList scope="infirmiere" filters={{ start, end, q }} />
    </div>
  );
}

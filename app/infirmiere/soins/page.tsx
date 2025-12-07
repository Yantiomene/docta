import SoinForm from "@/components/features/soins/SoinForm";
import SoinList from "@/components/features/soins/SoinList";

export default function InfirmiereSoinsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const message = searchParams?.error
    ? { kind: "error" as const, text: searchParams!.error }
    : searchParams?.success
    ? { kind: "success" as const, text: searchParams!.success }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Soins</h1>
      {message && (
        <div className={`rounded-md border px-3 py-2 ${message.kind === "error" ? "border-red-300 bg-red-50 text-red-700" : "border-green-300 bg-green-50 text-green-700"}`}>
          {message.text}
        </div>
      )}
      <SoinForm />
      <SoinList scope="infirmiere" />
    </div>
  );
}

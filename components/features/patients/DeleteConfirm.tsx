"use client";

import Button from "@/components/ui/button";

export default function DeleteConfirm({ formId, className }: { formId: string; className?: string }) {
  const handleClick = () => {
    const ok = typeof window !== "undefined" ? window.confirm("Confirmer la suppression du dossier patient ?") : false;
    if (!ok) return;
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) form.submit();
  };

  return (
    <Button type="button" onClick={handleClick} className={className || "bg-red-600 hover:bg-red-700"}>
      Supprimer
    </Button>
  );
}


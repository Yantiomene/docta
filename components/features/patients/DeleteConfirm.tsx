"use client";

import { useState } from "react";
import Button from "@/components/ui/button";

export default function DeleteConfirm({ formId, className }: { formId: string; className?: string }) {
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) form.submit();
    setOpen(false);
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className={className || "bg-red-600 hover:bg-red-700"}>
        Supprimer
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-lg border bg-white dark:bg-neutral-900 shadow-lg">
              <div className="p-4 border-b">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Confirmer la suppression</h3>
              </div>
              <div className="p-4 text-sm text-gray-700 dark:text-gray-200">
                Cette action supprimera définitivement le dossier patient. Êtes-vous sûr de vouloir continuer ?
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <Button type="button" onClick={() => setOpen(false)} className="bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700">
                  Annuler
                </Button>
                <Button type="button" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

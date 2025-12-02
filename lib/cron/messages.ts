export async function cleanupOldMessages(): Promise<{ deleted: number }> {
  // Placeholder: implement real cleanup against Supabase when schema is defined.
  // For now, simulate cleanup work to keep cron wiring consistent.
  const deleted = 0;
  return { deleted };
}

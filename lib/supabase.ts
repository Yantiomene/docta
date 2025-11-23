// Placeholder supabase client for scaffolding without installing dependencies yet.
// Integrate with '@supabase/supabase-js' later.

type SupabaseClientLike = unknown;

let client: SupabaseClientLike | null = null;

export function getSupabaseClient(): SupabaseClientLike {
  if (client) return client;
  // Initialize real client after adding dependencies and env vars
  client = {} as SupabaseClientLike;
  return client;
}

export async function getCurrentUser(): Promise<{ id: string } | null> {
  // Replace with supabase auth session retrieval
  return null;
}


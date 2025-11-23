export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}


import type { Role } from "./types";

export function hasRole(role: Role | undefined, allowed: Role | Role[]): boolean {
  if (!role) return false;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}

export const RolePaths: Record<Role, string> = {
  admin: "admin",
  medecin: "medecin",
  infirmiere: "infirmiere",
  patient: "patient",
};


import type { User } from "@/lib/types";

export function isProfileComplete(user: User | null | undefined): boolean {
  if (!user || user.role === "admin") return true;
  return Boolean(
    String(user.firstName || "").trim() &&
      String(user.phone || "").trim() &&
      String(user.birthDate || "").trim(),
  );
}

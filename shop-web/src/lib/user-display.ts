import type { Locale } from "@/i18n/messages";
import type { User } from "@/lib/types";
import { normalizeTierId, tierLabel } from "@/lib/tier";

export function displayName(user: Pick<User, "firstName" | "lastName"> | null) {
  if (!user) return "";
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
}

export function honorificName(
  user: Pick<User, "firstName" | "lastName"> | null,
  locale: Locale = "ko",
) {
  const name = displayName(user);
  if (!name) return "";
  if (locale === "en" || locale === "id") return name;
  return name.endsWith("님") ? name : `${name}님`;
}

export function userPoints(user: Pick<User, "points"> | null) {
  return Number(user?.points) || 0;
}

export function userTier(user: Pick<User, "tier" | "points"> | null) {
  return tierLabel(user?.tier);
}

export function userTierId(user: Pick<User, "tier"> | null) {
  return normalizeTierId(user?.tier);
}

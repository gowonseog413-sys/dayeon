import type { User } from "@/lib/types";

export function displayName(user: Pick<User, "firstName" | "lastName"> | null) {
  if (!user) return "";
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
}

export function honorificName(user: Pick<User, "firstName" | "lastName"> | null) {
  const name = displayName(user);
  if (!name) return "";
  return name.endsWith("님") ? name : `${name}님`;
}

export function userPoints(user: Pick<User, "points"> | null) {
  return Number(user?.points) || 0;
}

export function userTier(user: Pick<User, "tier" | "points"> | null) {
  if (user?.tier) return user.tier;
  const p = userPoints(user);
  if (p >= 10000) return "VIP";
  if (p >= 5000) return "골드";
  if (p >= 1000) return "실버";
  return "일반";
}

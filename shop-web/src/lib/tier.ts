export type TierId = "bronze" | "silver" | "gold" | "diamond";

export const TIER_ORDER: TierId[] = ["bronze", "silver", "gold", "diamond"];

export const TIER_LABELS: Record<TierId, string> = {
  bronze: "브론즈",
  silver: "실버",
  gold: "골드",
  diamond: "다이아몬드",
};

export const TIER_COLORS: Record<TierId, { bg: string; ring: string; text: string }> = {
  bronze: { bg: "#f5e6d3", ring: "#b87333", text: "#8b5a2b" },
  silver: { bg: "#f0f0f0", ring: "#a8a8a8", text: "#5c5c5c" },
  gold: { bg: "#fff8e1", ring: "#d4a017", text: "#9a7b0a" },
  diamond: { bg: "#e8f4fc", ring: "#5bc0de", text: "#2a7a9b" },
};

export function normalizeTierId(tier?: string | null): TierId {
  const raw = String(tier || "").toLowerCase();
  if (raw === "bronze" || raw.includes("브론")) return "bronze";
  if (raw === "silver" || raw.includes("실버")) return "silver";
  if (raw === "gold" || raw.includes("골드")) return "gold";
  if (raw === "diamond" || raw.includes("다이아") || raw === "vip") return "diamond";
  return "bronze";
}

export function tierLabel(tier?: string | null): string {
  return TIER_LABELS[normalizeTierId(tier)];
}

export function tierMessageKey(tier?: string | null): string {
  return `tier.${normalizeTierId(tier)}`;
}

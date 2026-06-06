export const TIER_IDS = ["bronze", "silver", "gold", "diamond"];

export const TIER_LABELS = {
  bronze: "브론즈",
  silver: "실버",
  gold: "골드",
  diamond: "다이아몬드",
};

/** 누적 구매금액 기준 회원 등급 */
export function computeUserTierFromPurchase(totalPurchaseAmount, thresholds) {
  const amount = Number(totalPurchaseAmount) || 0;
  const diamond = Number(thresholds?.tierDiamond ?? thresholds?.tierVip) || 10000000;
  const gold = Number(thresholds?.tierGold) || 5000000;
  const silver = Number(thresholds?.tierSilver) || 1000000;
  if (amount >= diamond) return "diamond";
  if (amount >= gold) return "gold";
  if (amount >= silver) return "silver";
  return "bronze";
}

export function tierLabel(tierId) {
  return TIER_LABELS[tierId] || TIER_LABELS.bronze;
}

export function normalizeTierId(tier) {
  const raw = String(tier || "").toLowerCase();
  if (TIER_IDS.includes(raw)) return raw;
  if (raw.includes("다이아") || raw === "vip") return "diamond";
  if (raw.includes("골드") || raw === "gold") return "gold";
  if (raw.includes("실버") || raw === "silver") return "silver";
  return "bronze";
}

export function getEarnRateForTier(tierId, settings) {
  const tier = normalizeTierId(tierId);
  const map = {
    bronze: settings?.earnRateBronze,
    silver: settings?.earnRateSilver,
    gold: settings?.earnRateGold,
    diamond: settings?.earnRateDiamond,
  };
  const fallback = Number(settings?.earnRatePercent) || 1;
  const rate = Number(map[tier]);
  return Number.isFinite(rate) ? Math.max(0, Math.min(100, rate)) : fallback;
}

export function getUserTotalPurchase(db, userId) {
  return db.orders
    .filter((o) => o.userId === userId && o.status === "completed")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
}

export function syncUserTier(db, userId, settings) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const thresholds = settings || db.settings?.points;
  const total = getUserTotalPurchase(db, userId);
  user.tier = computeUserTierFromPurchase(total, thresholds);
  return user.tier;
}

/** @deprecated 포인트 기준 — 구매금액 기준으로 대체됨 */
export function computeUserTier(points, thresholds) {
  return computeUserTierFromPurchase(points, thresholds);
}

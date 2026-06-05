import { computeUserTier } from "./user-tier.js";

export const DEFAULT_POINTS_SETTINGS = {
  earnRatePercent: 1,
  tierSilver: 1000,
  tierGold: 5000,
  tierVip: 10000,
};

export const DEFAULT_REFERRAL_SETTINGS = {
  enabled: true,
  referrerReward: 5000,
  refereeReward: 3000,
  description: "친구 초대 시 추천인·피추천인 모두 포인트를 적립합니다.",
};

function memberName(u) {
  return `${u.firstName || ""}${u.lastName ? ` ${u.lastName}` : ""}`.trim() || "-";
}

export function ensureMemberSettings(db) {
  if (!db.settings) db.settings = {};
  if (!db.settings.points) {
    db.settings.points = { ...DEFAULT_POINTS_SETTINGS };
  } else {
    db.settings.points = { ...DEFAULT_POINTS_SETTINGS, ...db.settings.points };
  }
  if (!db.settings.referral) {
    db.settings.referral = { ...DEFAULT_REFERRAL_SETTINGS };
  } else {
    db.settings.referral = { ...DEFAULT_REFERRAL_SETTINGS, ...db.settings.referral };
  }
  return db.settings;
}

export function normalizePointsSettings(raw) {
  return {
    earnRatePercent: Math.max(0, Math.min(100, Number(raw?.earnRatePercent) || 0)),
    tierSilver: Math.max(0, Math.floor(Number(raw?.tierSilver) || DEFAULT_POINTS_SETTINGS.tierSilver)),
    tierGold: Math.max(0, Math.floor(Number(raw?.tierGold) || DEFAULT_POINTS_SETTINGS.tierGold)),
    tierVip: Math.max(0, Math.floor(Number(raw?.tierVip) || DEFAULT_POINTS_SETTINGS.tierVip)),
  };
}

export function normalizeReferralSettings(raw) {
  return {
    enabled: raw?.enabled !== false,
    referrerReward: Math.max(0, Math.floor(Number(raw?.referrerReward) || 0)),
    refereeReward: Math.max(0, Math.floor(Number(raw?.refereeReward) || 0)),
    description: String(raw?.description || DEFAULT_REFERRAL_SETTINGS.description).trim(),
  };
}

export function referralCodeForUser(user) {
  if (user.referralCode) return user.referralCode;
  const base = String(user.firstName || user.email?.split("@")[0] || "DY")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const suffix = String(user.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  return `${base || "DY"}${suffix || "0000"}`;
}

export function ensureUserReferralCodes(db) {
  for (const u of db.users) {
    if (!u.referralCode) {
      u.referralCode = referralCodeForUser(u);
    }
  }
}

export function buildPointsMemberRows(db) {
  ensureMemberSettings(db);
  const tiers = db.settings.points;
  return [...db.users]
    .map((u) => ({
      id: u.id,
      name: memberName(u),
      email: u.email,
      role: u.role,
      points: Number(u.points) || 0,
      tier: u.tier || computeUserTier(u.points, tiers),
      createdAt: u.createdAt || null,
    }))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export function buildReferralRows(db) {
  ensureUserReferralCodes(db);
  return db.users
    .filter((u) => u.referredBy)
    .map((u) => {
      const referrer = db.users.find((r) => r.id === u.referredBy);
      return {
        id: u.id,
        refereeName: memberName(u),
        refereeEmail: u.email,
        referrerId: referrer?.id || u.referredBy,
        referrerName: referrer ? memberName(referrer) : "-",
        referrerEmail: referrer?.email || "-",
        referralCode: referrer ? referralCodeForUser(referrer) : "-",
        referredAt: u.createdAt || null,
      };
    })
    .sort((a, b) => String(b.referredAt || "").localeCompare(String(a.referredAt || "")));
}

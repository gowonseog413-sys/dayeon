import { getUserTotalPurchase, syncUserTier } from "./user-tier.js";

export const DEFAULT_POINTS_SETTINGS = {
  tierSilver: 1000000,
  tierGold: 5000000,
  tierDiamond: 10000000,
  earnRateBronze: 0.5,
  earnRateSilver: 1,
  earnRateGold: 1.5,
  earnRateDiamond: 2,
};

export const DEFAULT_WELCOME_MESSAGE = `가입해 주셔서 감사합니다.
감사의 마음으로 {points}포인트를 적립해 드렸습니다.
언제든지 현금처럼 사용 가능합니다.`;

export const DEFAULT_SIGNUP_BONUS = {
  enabled: true,
  points: 100,
  welcomeMessageEnabled: true,
  welcomeMessage: DEFAULT_WELCOME_MESSAGE,
};

export const DEFAULT_REVIEW_REWARD = {
  enabled: true,
  points: 1000,
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
    const legacy = db.settings.points;
    db.settings.points = {
      ...DEFAULT_POINTS_SETTINGS,
      ...legacy,
      tierDiamond:
        legacy.tierDiamond ?? legacy.tierVip ?? DEFAULT_POINTS_SETTINGS.tierDiamond,
    };
    delete db.settings.points.tierVip;
    delete db.settings.points.earnRatePercent;
  }
  if (!db.settings.signupBonus) {
    db.settings.signupBonus = { ...DEFAULT_SIGNUP_BONUS };
  } else {
    db.settings.signupBonus = {
      ...DEFAULT_SIGNUP_BONUS,
      ...db.settings.signupBonus,
    };
  }
  if (!db.settings.referral) {
    db.settings.referral = { ...DEFAULT_REFERRAL_SETTINGS };
  } else {
    db.settings.referral = { ...DEFAULT_REFERRAL_SETTINGS, ...db.settings.referral };
  }
  if (!db.settings.reviewReward) {
    db.settings.reviewReward = { ...DEFAULT_REVIEW_REWARD };
  } else {
    db.settings.reviewReward = {
      ...DEFAULT_REVIEW_REWARD,
      ...db.settings.reviewReward,
    };
  }
  return db.settings;
}

export function normalizePointsSettings(raw) {
  return {
    tierSilver: Math.max(
      0,
      Math.floor(Number(raw?.tierSilver) || DEFAULT_POINTS_SETTINGS.tierSilver),
    ),
    tierGold: Math.max(
      0,
      Math.floor(Number(raw?.tierGold) || DEFAULT_POINTS_SETTINGS.tierGold),
    ),
    tierDiamond: Math.max(
      0,
      Math.floor(
        Number(raw?.tierDiamond ?? raw?.tierVip) || DEFAULT_POINTS_SETTINGS.tierDiamond,
      ),
    ),
    earnRateBronze: Math.max(
      0,
      Math.min(100, Number(raw?.earnRateBronze) ?? DEFAULT_POINTS_SETTINGS.earnRateBronze),
    ),
    earnRateSilver: Math.max(
      0,
      Math.min(100, Number(raw?.earnRateSilver) ?? DEFAULT_POINTS_SETTINGS.earnRateSilver),
    ),
    earnRateGold: Math.max(
      0,
      Math.min(100, Number(raw?.earnRateGold) ?? DEFAULT_POINTS_SETTINGS.earnRateGold),
    ),
    earnRateDiamond: Math.max(
      0,
      Math.min(100, Number(raw?.earnRateDiamond) ?? DEFAULT_POINTS_SETTINGS.earnRateDiamond),
    ),
  };
}

export function normalizeReviewReward(raw) {
  return {
    enabled: raw?.enabled !== false,
    points: Math.max(0, Math.floor(Number(raw?.points) || 0)),
  };
}

export function normalizeSignupBonus(raw) {
  const welcomeMessage =
    typeof raw?.welcomeMessage === "string" && raw.welcomeMessage.trim()
      ? raw.welcomeMessage.trim().slice(0, 2000)
      : DEFAULT_WELCOME_MESSAGE;
  return {
    enabled: raw?.enabled !== false,
    points: Math.max(0, Math.floor(Number(raw?.points) || 0)),
    welcomeMessageEnabled: raw?.welcomeMessageEnabled !== false,
    welcomeMessage,
  };
}

export function syncAllUserTiers(db) {
  for (const user of db.users) {
    if (user.role === "admin") continue;
    syncUserTier(db, user.id);
  }
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
  syncAllUserTiers(db);
  return [...db.users]
    .map((u) => ({
      id: u.id,
      name: memberName(u),
      email: u.email,
      role: u.role,
      points: Number(u.points) || 0,
      pointsUsed: Number(u.pointsUsed) || 0,
      tier: u.tier || "bronze",
      totalPurchaseAmount: getUserTotalPurchase(db, u.id),
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

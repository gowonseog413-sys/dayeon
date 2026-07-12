import { ensureMemberSettings, referralCodeForUser } from "./member-settings.js";
import { memberName, recordPointTransaction } from "./point-transactions.js";
import { syncUserTier } from "./user-tier.js";

export function resolveReferrerId(db, referralCodeInput, excludeUserId = null) {
  if (!referralCodeInput) return null;
  ensureMemberSettings(db);
  const refSettings = db.settings.referral;
  if (!refSettings.enabled) return null;

  const code = String(referralCodeInput).trim().toUpperCase();
  if (!code) return null;

  const referrer = db.users.find(
    (u) =>
      u.id !== excludeUserId &&
      u.role !== "admin" &&
      (referralCodeForUser(u).toUpperCase() === code || u.referralCode?.toUpperCase() === code),
  );
  return referrer?.id || null;
}

export function applyReferralRewards(db, user, referrerId) {
  if (!referrerId || user.referredBy) return false;

  ensureMemberSettings(db);
  const refSettings = db.settings.referral;
  if (!refSettings.enabled) return false;

  user.referredBy = referrerId;
  const createdAt = user.createdAt || new Date().toISOString();
  const referrer = db.users.find((u) => u.id === referrerId);

  const referrerReward = Math.max(0, Math.floor(Number(refSettings.referrerReward) || 0));
  if (referrer && referrerReward > 0) {
    referrer.points = (Number(referrer.points) || 0) + referrerReward;
    syncUserTier(db, referrer.id, db.settings.points);
    recordPointTransaction(db, {
      userId: referrer.id,
      amount: referrerReward,
      type: "referral_referrer",
      label: `${memberName(user)} 추천인 적립`,
      refId: `referral-referrer-${user.id}`,
      createdAt,
    });
  }

  const refereeReward = Math.max(0, Math.floor(Number(refSettings.refereeReward) || 0));
  if (refereeReward > 0) {
    user.points = (Number(user.points) || 0) + refereeReward;
    recordPointTransaction(db, {
      userId: user.id,
      amount: refereeReward,
      type: "referral_referee",
      label: "추천인 가입 적립",
      refId: `referral-referee-${user.id}`,
      createdAt,
    });
  }

  return true;
}

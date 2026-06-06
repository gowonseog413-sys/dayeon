import { v4 as uuid } from "uuid";
import { ensureMemberSettings, referralCodeForUser } from "./member-settings.js";

function memberName(u) {
  if (!u) return "-";
  return `${u.firstName || ""}${u.lastName ? ` ${u.lastName}` : ""}`.trim() || "-";
}

function toAmount(value) {
  return Math.floor(Number(value) || 0);
}

function positiveAmount(value) {
  return Math.max(0, toAmount(value));
}

function paginate(entries, { page = 1, pageSize = 5 } = {}) {
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: entries.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function ensurePointTransactions(db) {
  if (!Array.isArray(db.pointTransactions)) db.pointTransactions = [];
}

/**
 * 포인트 변동 원장 기록 — refId로 중복 방지 (주문·리뷰 등 동일 이벤트 재기록 방지)
 */
export function recordPointTransaction(
  db,
  { userId, amount, type, label, refId = null, createdAt = null },
) {
  ensurePointTransactions(db);
  const amt = toAmount(amount);
  if (amt === 0 || !userId) return null;

  const id = refId || uuid();
  if (db.pointTransactions.some((t) => t.id === id)) return null;

  const tx = {
    id,
    userId,
    type: type || "manual",
    label:
      label || (amt >= 0 ? "포인트 적립" : "포인트 사용"),
    amount: amt,
    createdAt: createdAt || new Date().toISOString(),
  };
  db.pointTransactions.push(tx);
  return tx;
}

/** 기존 주문·리뷰·가입·추천 데이터에서 원장 미기록 건을 1회 백필 */
function collectLegacyEntriesForUser(db, userId) {
  ensureMemberSettings(db);
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [];

  const entries = [];
  const seen = new Set();

  const add = (entry) => {
    if (seen.has(entry.id)) return;
    const amount = toAmount(entry.amount);
    if (amount === 0) return;
    seen.add(entry.id);
    entries.push({ ...entry, amount });
  };

  for (const order of db.orders || []) {
    if (order.userId !== userId) continue;

    const earned = positiveAmount(order.pointsEarned);
    if (earned > 0 && order.pointsAwarded) {
      add({
        id: `order-earn-${order.id}`,
        type: "order_earn",
        label: order.orderNumber ? `구매 적립 (${order.orderNumber})` : "구매 적립",
        amount: earned,
        createdAt: order.pointsEarnedAt || order.updatedAt || order.createdAt,
      });
    }

    const usedAtOrder = positiveAmount(order.pointsUsed);
    if (usedAtOrder > 0 && !order.pointsRefundedAt) {
      add({
        id: `order-use-${order.id}`,
        type: "order_use",
        label: order.orderNumber ? `주문 포인트 사용 (${order.orderNumber})` : "주문 포인트 사용",
        amount: -usedAtOrder,
        createdAt: order.createdAt,
      });
    }

    const refunded = positiveAmount(order.pointsRefundedAmount);
    if (refunded > 0 && order.pointsRefundedAt) {
      add({
        id: `order-refund-${order.id}`,
        type: "order_refund",
        label: order.orderNumber ? `주문 취소 환불 (${order.orderNumber})` : "주문 취소 환불",
        amount: refunded,
        createdAt: order.pointsRefundedAt,
      });
    }
  }

  for (const review of db.reviews || []) {
    if (review.userId !== userId) continue;
    const amount = positiveAmount(review.pointsAwarded);
    if (amount > 0) {
      add({
        id: `review-${review.id}`,
        type: "review",
        label: "리뷰 작성 적립",
        amount,
        createdAt: review.pointsAwardedAt || review.createdAt,
      });
    }
  }

  const signupBonus = db.settings.signupBonus;
  if (signupBonus?.enabled) {
    const amount = positiveAmount(signupBonus.points);
    if (amount > 0) {
      add({
        id: `signup-${userId}`,
        type: "signup",
        label: "가입 포인트",
        amount,
        createdAt: user.createdAt,
      });
    }
  }

  const referral = db.settings.referral;
  if (referral?.enabled && user.referredBy) {
    const amount = positiveAmount(referral.refereeReward);
    if (amount > 0) {
      add({
        id: `referral-referee-${userId}`,
        type: "referral_referee",
        label: "추천인 가입 적립",
        amount,
        createdAt: user.createdAt,
      });
    }
  }

  if (referral?.enabled) {
    const referrerAmount = positiveAmount(referral.referrerReward);
    if (referrerAmount > 0) {
      for (const referee of db.users) {
        if (referee.referredBy !== userId) continue;
        add({
          id: `referral-referrer-${referee.id}`,
          type: "referral_referrer",
          label: `${memberName(referee)} 추천인 적립`,
          amount: referrerAmount,
          createdAt: referee.createdAt,
        });
      }
    }
  }

  return entries;
}

export function backfillPointTransactions(db) {
  ensurePointTransactions(db);
  if (db.pointTransactions.length > 0) return false;

  for (const user of db.users || []) {
    for (const entry of collectLegacyEntriesForUser(db, user.id)) {
      recordPointTransaction(db, {
        userId: user.id,
        amount: entry.amount,
        type: entry.type,
        label: entry.label,
        refId: entry.id,
        createdAt: entry.createdAt,
      });
    }
  }
  return true;
}

/** 원장 배열 보장 + 기존 데이터 1회 백필 (updateDb 안에서 호출) */
export function ensurePointLedger(db) {
  ensurePointTransactions(db);
  backfillPointTransactions(db);
}

function sortedUserTransactions(db, userId) {
  return (db.pointTransactions || [])
    .filter((t) => t.userId === userId)
    .map((t) => ({
      id: t.id,
      type: t.type,
      label: t.label,
      amount: toAmount(t.amount),
      createdAt: t.createdAt,
    }))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

/** 회원 포인트 획득·사용 이력 (원장 기준) */
export function listUserPointHistory(db, userId, { page = 1, pageSize = 5 } = {}) {
  ensurePointTransactions(db);
  return paginate(sortedUserTransactions(db, userId), { page, pageSize });
}

/** ERP — 전 회원 포인트 적립/사용 내역 */
export function listAllPointTransactions(db, { page = 1, pageSize = 20 } = {}) {
  ensurePointTransactions(db);

  const entries = (db.pointTransactions || [])
    .map((tx) => {
      const user = db.users.find((u) => u.id === tx.userId);
      return {
        id: tx.id,
        userId: tx.userId,
        userName: memberName(user),
        userEmail: user?.email || "",
        type: tx.type,
        label: tx.label,
        amount: toAmount(tx.amount),
        createdAt: tx.createdAt,
      };
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  return paginate(entries, { page, pageSize });
}

/** @deprecated listUserPointHistory 사용 */
export function listUserPointEarnings(db, userId, opts) {
  return listUserPointHistory(db, userId, opts);
}

/** 내 추천코드로 가입한 회원 목록 */
export function listUserReferrals(db, userId, { page = 1, pageSize = 5 } = {}) {
  ensureMemberSettings(db);
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return {
      referralCode: "",
      settings: { enabled: false, referrerReward: 0, refereeReward: 0, description: "" },
      items: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const referral = db.settings.referral || {};
  const reward = referral.enabled ? positiveAmount(referral.referrerReward) : 0;

  const rows = db.users
    .filter((u) => u.referredBy === userId)
    .map((u) => ({
      id: u.id,
      name: memberName(u),
      email: u.email,
      referredAt: u.createdAt || null,
      reward,
    }))
    .sort((a, b) => String(b.referredAt || "").localeCompare(String(a.referredAt || "")));

  const paged = paginate(rows, { page, pageSize });

  return {
    referralCode: referralCodeForUser(user),
    settings: {
      enabled: Boolean(referral.enabled),
      referrerReward: positiveAmount(referral.referrerReward),
      refereeReward: positiveAmount(referral.refereeReward),
      description: referral.description || "",
    },
    ...paged,
  };
}

export { memberName };

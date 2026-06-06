import { ensureMemberSettings } from "./member-settings.js";
import { recordPointTransaction } from "./point-transactions.js";
import { sendWelcomeMessage } from "./user-messages.js";
import { isProductPointsEnabled } from "./product-dates.js";
import {
  getEarnRateForTier,
  getUserTotalPurchase,
  normalizeTierId,
  syncUserTier,
} from "./user-tier.js";

export { getUserTotalPurchase, syncUserTier };

/** 포인트 사용(차감) — 누적 사용액(pointsUsed) 증가 */
export function deductUserPoints(db, user, amount, options = {}) {
  const requested = Math.max(0, Math.floor(Number(amount) || 0));
  if (requested <= 0 || !user) return { used: 0 };
  const balance = Math.max(0, Number(user.points) || 0);
  const used = Math.min(requested, balance);
  if (used <= 0) return { used: 0 };
  user.points = balance - used;
  user.pointsUsed = (Number(user.pointsUsed) || 0) + used;

  recordPointTransaction(db, {
    userId: user.id,
    amount: -used,
    type: "order_use",
    label: options.orderNumber
      ? `주문 포인트 사용 (${options.orderNumber})`
      : "주문 포인트 사용",
    refId: options.orderId ? `order-use-${options.orderId}` : null,
    createdAt: options.createdAt,
  });

  return { used };
}

/** 주문 취소 시 사용 포인트 환불 */
export function refundOrderPoints(db, order) {
  const used = Math.max(0, Math.floor(Number(order?.pointsUsed) || 0));
  if (used <= 0 || !order?.userId) return 0;
  const user = db.users.find((u) => u.id === order.userId);
  if (!user) return 0;
  user.points = (Number(user.points) || 0) + used;
  user.pointsUsed = Math.max(0, (Number(user.pointsUsed) || 0) - used);
  order.pointsRefundedAmount = used;
  order.pointsUsed = 0;
  order.pointsRefundedAt = new Date().toISOString();

  recordPointTransaction(db, {
    userId: user.id,
    amount: used,
    type: "order_refund",
    label: order.orderNumber
      ? `주문 취소 환불 (${order.orderNumber})`
      : "주문 취소 환불",
    refId: `order-refund-${order.id}`,
    createdAt: order.pointsRefundedAt,
  });

  return used;
}

export function applyReviewReward(db, user, review) {
  ensureMemberSettings(db);
  const reward = db.settings.reviewReward;
  if (!reward?.enabled) return 0;
  const amount = Math.max(0, Math.floor(Number(reward.points) || 0));
  if (amount <= 0) return 0;
  user.points = (Number(user.points) || 0) + amount;
  review.pointsAwarded = amount;
  review.pointsAwardedAt = new Date().toISOString();

  recordPointTransaction(db, {
    userId: user.id,
    amount,
    type: "review",
    label: "리뷰 작성 적립",
    refId: `review-${review.id}`,
    createdAt: review.pointsAwardedAt,
  });

  return amount;
}

export function applySignupBonus(db, user) {
  ensureMemberSettings(db);
  user.tier = "bronze";
  const bonus = db.settings.signupBonus;
  let amount = 0;
  if (bonus?.enabled) {
    amount = Math.max(0, Math.floor(Number(bonus.points) || 0));
    if (amount > 0) {
      user.points = (Number(user.points) || 0) + amount;
      recordPointTransaction(db, {
        userId: user.id,
        amount,
        type: "signup",
        label: "가입 포인트",
        refId: `signup-${user.id}`,
        createdAt: user.createdAt,
      });
    }
  }
  sendWelcomeMessage(db, user, amount);
  return amount;
}

/** 주문 항목 중 포인트 적립 대상 금액 (상품별 pointsEnabled 반영) */
export function getOrderPointsEligibleTotal(db, order) {
  let total = 0;
  for (const item of order.items || []) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!isProductPointsEnabled(product)) continue;
    const line =
      Number(item.lineTotal) ||
      (Number(item.priceSale) || 0) * (Number(item.quantity) || 1);
    total += line;
  }
  return total;
}

export function applyOrderCompletionRewards(db, order) {
  if (!order || order.status !== "completed" || order.pointsAwarded) return null;
  ensureMemberSettings(db);
  const user = db.users.find((u) => u.id === order.userId);
  if (!user || user.role === "admin") return null;

  syncUserTier(db, user.id, db.settings.points);
  const tier = normalizeTierId(user.tier);
  const rate = getEarnRateForTier(tier, db.settings.points);
  const eligibleTotal = getOrderPointsEligibleTotal(db, order);
  const earned = Math.floor(eligibleTotal * (rate / 100));

  if (earned > 0) {
    user.points = (Number(user.points) || 0) + earned;
  }

  order.pointsAwarded = true;
  order.pointsEarned = earned;
  order.pointsEligibleTotal = eligibleTotal;
  order.pointsEarnedAt = new Date().toISOString();
  order.pointsEarnedTier = tier;

  if (earned > 0) {
    recordPointTransaction(db, {
      userId: user.id,
      amount: earned,
      type: "order_earn",
      label: order.orderNumber ? `구매 적립 (${order.orderNumber})` : "구매 적립",
      refId: `order-earn-${order.id}`,
      createdAt: order.pointsEarnedAt,
    });
  }

  return { earned, tier, rate, eligibleTotal };
}

export function processCompletedOrdersRewards(db) {
  const results = [];
  for (const order of db.orders) {
    if (order.status !== "completed" || order.pointsAwarded) continue;
    const result = applyOrderCompletionRewards(db, order);
    if (result) results.push({ orderId: order.id, ...result });
  }
  return results;
}

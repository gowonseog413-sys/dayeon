import { shouldAutoCompleteDelivery } from "./indonesia-business-days.js";
import { updateDb } from "./db.js";
import { applyOrderCompletionRewards } from "./points-rewards.js";

const DELIVERED_STATUS = "completed";

/** 발송(shipped) 후 영업일 5일 경과 시 배송완료(completed) 자동 처리 */
export function syncOrderDeliveryStatus(db) {
  const now = new Date().toISOString();
  const toComplete = [];

  for (const order of db.orders) {
    if (order.status !== "shipped" || !order.shippedAt) continue;
    if (!shouldAutoCompleteDelivery(order.shippedAt, 5)) continue;
    toComplete.push(order.id);
  }

  if (!toComplete.length) return false;

  updateDb((d) => {
    for (const id of toComplete) {
      const order = d.orders.find((o) => o.id === id);
      if (!order || order.status !== "shipped") continue;
      order.status = DELIVERED_STATUS;
      order.completedAt = now;
      order.autoCompleted = true;
      applyOrderCompletionRewards(d, order);
    }
  });

  return true;
}

export function isDeliveredOrder(order) {
  return order?.status === DELIVERED_STATUS;
}

export function markOrderShipped(order) {
  order.status = "shipped";
  order.shippedAt = new Date().toISOString();
}

export function markOrderCompleted(order, { auto = false } = {}) {
  order.status = DELIVERED_STATUS;
  order.completedAt = new Date().toISOString();
  if (auto) order.autoCompleted = true;
}

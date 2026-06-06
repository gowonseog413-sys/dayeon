import { isDeliveredOrder } from "./order-delivery.js";

export function userHasReviewedProduct(db, userId, productId) {
  return (db.reviews || []).some(
    (r) => r.userId === userId && r.productId === productId,
  );
}

/** 배송완료 주문에 포함된 상품만 리뷰 가능 (상품당 1회) */
export function userCanReviewProduct(db, userId, productId) {
  if (!userId || !productId) return { ok: false, reason: "login_required" };
  if (userHasReviewedProduct(db, userId, productId)) {
    return { ok: false, reason: "already_reviewed" };
  }

  const order = findLatestDeliveredOrderWithProduct(db, userId, productId);
  if (!order) {
    return { ok: false, reason: "not_delivered" };
  }

  return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
}

export function findLatestDeliveredOrderWithProduct(db, userId, productId) {
  return db.orders
    .filter(
      (o) =>
        o.userId === userId &&
        isDeliveredOrder(o) &&
        o.items?.some((i) => i.productId === productId),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function listUserReviewableItems(db, userId) {
  const reviewed = new Set(
    (db.reviews || [])
      .filter((r) => r.userId === userId)
      .map((r) => r.productId),
  );

  const seen = new Set();
  const items = [];

  const orders = db.orders
    .filter((o) => o.userId === userId && isDeliveredOrder(o))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  for (const order of orders) {
    for (const item of order.items || []) {
      if (reviewed.has(item.productId) || seen.has(item.productId)) continue;
      seen.add(item.productId);
      const product = db.products.find((p) => p.id === item.productId);
      items.push({
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        image: item.image || product?.image || null,
        orderId: order.id,
        orderNumber: order.orderNumber,
        deliveredAt: order.completedAt || order.shippedAt || order.createdAt,
      });
    }
  }

  return items;
}

export function listUserReviews(db, userId) {
  return (db.reviews || [])
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => {
      const product = db.products.find((p) => p.id === r.productId);
      return {
        ...r,
        productName: product?.name || "",
        productBrand: product?.brand || "",
        productImage: product?.image || null,
      };
    });
}

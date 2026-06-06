/** 동일 productId 항목 수량 합산 (표시·저장용) */
export function consolidateOrderItems(items) {
  if (!Array.isArray(items)) return [];
  const map = new Map();

  for (const raw of items) {
    const productId = String(raw?.productId || "").trim();
    if (!productId) continue;

    const priceSale = Number(raw.priceSale) || 0;
    const quantity = Math.max(1, Number(raw.quantity) || 1);
    const prev = map.get(productId);

    if (prev) {
      const nextQty = prev.quantity + quantity;
      map.set(productId, {
        ...prev,
        image: prev.image || raw.image || null,
        quantity: nextQty,
        lineTotal: prev.priceSale * nextQty,
      });
    } else {
      map.set(productId, {
        productId,
        name: raw.name,
        brand: raw.brand,
        image: raw.image || null,
        priceSale,
        quantity,
        lineTotal: priceSale * quantity,
      });
    }
  }

  return [...map.values()];
}

export function enrichOrder(db, order) {
  if (!order) return order;
  const withImages = order.items.map((item) => ({
    ...item,
    image:
      item.image ||
      db.products.find((p) => p.id === item.productId)?.image ||
      null,
  }));
  return {
    ...order,
    items: consolidateOrderItems(withImages),
  };
}

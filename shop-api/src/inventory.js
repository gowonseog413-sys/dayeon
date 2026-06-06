/** 상품 재고 조회·주문 검증·차감·복구 */

export function productStock(product) {
  return Math.max(0, Math.floor(Number(product?.stock) || 0));
}

/**
 * 주문 항목 재고 검증 및 수량 조정
 * @returns {{ status: 'ok'|'adjusted'|'blocked', lines: object[], orderItems: object[], messages: string[] }}
 */
export function checkOrderStock(db, orderItems) {
  const lines = [];
  const adjusted = [];
  const messages = [];

  for (const item of orderItems) {
    const product = db.products.find((p) => p.id === item.productId);
    const requestedQty = Math.max(1, Number(item.quantity) || 1);
    const name = product?.name || item.name || item.productId;
    const brand = product?.brand || item.brand || "";
    const availableStock = product ? productStock(product) : 0;

    let orderQty = 0;
    let issue = null;

    if (!product) {
      issue = "missing";
      messages.push(`「${name}」 상품을 찾을 수 없습니다.`);
    } else if (availableStock <= 0) {
      issue = "out_of_stock";
      messages.push(`「${name}」 — 재고가 없어 주문할 수 없습니다.`);
    } else if (availableStock < requestedQty) {
      issue = "insufficient";
      orderQty = availableStock;
      messages.push(
        `「${name}」 — 재고가 ${availableStock}개뿐이어서 ${orderQty}개만 주문 가능합니다. (요청 ${requestedQty}개)`,
      );
    } else {
      orderQty = requestedQty;
    }

    lines.push({
      productId: item.productId,
      name,
      brand,
      requestedQty,
      availableStock,
      orderQty,
      issue,
    });

    if (orderQty > 0) {
      adjusted.push({
        ...item,
        quantity: orderQty,
        lineTotal: (Number(item.priceSale) || 0) * orderQty,
      });
    }
  }

  if (!adjusted.length) {
    return {
      status: "blocked",
      lines,
      orderItems: [],
      messages: messages.length
        ? messages
        : ["선택하신 상품의 재고가 없어 구매가 어렵습니다."],
    };
  }

  const hasIssue = lines.some((l) => l.issue);
  return {
    status: hasIssue ? "adjusted" : "ok",
    lines,
    orderItems: adjusted,
    messages,
  };
}

/** 주문 확정 시 재고 차감 — 재고 부족 시 throw */
export function deductStockForOrder(db, orderItems) {
  for (const item of orderItems) {
    const idx = db.products.findIndex((p) => p.id === item.productId);
    if (idx < 0) {
      throw Object.assign(new Error(`상품 없음: ${item.productId}`), { code: "STOCK_UNAVAILABLE" });
    }
    const product = db.products[idx];
    const stock = productStock(product);
    const qty = Math.max(1, Number(item.quantity) || 1);
    if (stock < qty) {
      throw Object.assign(
        new Error(`「${product.name}」 재고가 부족합니다. (재고 ${stock}개)`),
        { code: "STOCK_UNAVAILABLE" },
      );
    }
    db.products[idx] = { ...product, stock: stock - qty };
  }
}

/** 주문 취소 시 재고 복구 */
export function restoreStockForOrder(db, orderItems) {
  if (!Array.isArray(orderItems)) return;
  for (const item of orderItems) {
    const idx = db.products.findIndex((p) => p.id === item.productId);
    if (idx < 0) continue;
    const product = db.products[idx];
    const qty = Math.max(0, Number(item.quantity) || 0);
    db.products[idx] = { ...product, stock: productStock(product) + qty };
  }
}

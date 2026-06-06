import { api } from "@/lib/api";
import { saveCart } from "@/lib/cart-store";
import type { CartItem } from "@/lib/types";

export type StockLineIssue = "missing" | "out_of_stock" | "insufficient" | null;

export type StockCheckLine = {
  productId: string;
  name: string;
  brand: string;
  requestedQty: number;
  availableStock: number;
  orderQty: number;
  issue: StockLineIssue;
};

export type StockCheckResult = {
  status: "ok" | "adjusted" | "blocked";
  lines: StockCheckLine[];
  orderItems: { productId: string; quantity: number }[];
  messages: string[];
};

export async function checkOrderStock(
  items: { productId: string; quantity: number }[],
  token?: string | null,
): Promise<StockCheckResult> {
  return api<StockCheckResult>("/api/orders/check-stock", {
    method: "POST",
    token,
    body: JSON.stringify({ items }),
  });
}

/** 재고 검증 결과에 맞게 장바구니 수량·항목 조정 */
export function applyStockAdjustmentsToCart(
  cart: CartItem[],
  orderItems: { productId: string; quantity: number }[],
): CartItem[] {
  const orderMap = new Map(orderItems.map((i) => [i.productId, i.quantity]));
  const byProduct = new Map<string, CartItem[]>();

  for (const line of cart) {
    const list = byProduct.get(line.productId) || [];
    list.push(line);
    byProduct.set(line.productId, list);
  }

  const next: CartItem[] = [];
  for (const [productId, lines] of byProduct) {
    const orderQty = orderMap.get(productId);
    if (!orderQty || orderQty <= 0) continue;
    const sorted = [...lines].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    next.push({ ...sorted[0], quantity: orderQty });
  }

  return next.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function persistStockAdjustments(
  cart: CartItem[],
  orderItems: { productId: string; quantity: number }[],
) {
  const adjusted = applyStockAdjustmentsToCart(cart, orderItems);
  saveCart(adjusted);
  return adjusted;
}

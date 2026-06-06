"use client";

import { useCallback, useState } from "react";
import { getToken } from "@/lib/auth-store";
import { getCart } from "@/lib/cart-store";
import {
  checkOrderStock,
  persistStockAdjustments,
  type StockCheckResult,
} from "@/lib/stock-checkout";

type GateState = {
  open: boolean;
  mode: "blocked" | "adjusted" | null;
  result: StockCheckResult | null;
  onProceed?: () => void;
};

const closed: GateState = { open: false, mode: null, result: null };

export function useStockCheckoutGate() {
  const [gate, setGate] = useState<GateState>(closed);
  const [loading, setLoading] = useState(false);

  const closeGate = useCallback(() => setGate(closed), []);

  /** 결제 전 재고 검증 — 통과 시 true, 차단·취소 시 false */
  const runStockGate = useCallback(
    async (onProceed: () => void) => {
      const cart = getCart();
      if (!cart.length) return false;

      setLoading(true);
      try {
        const result = await checkOrderStock(
          cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
          getToken(),
        );

        if (result.status === "blocked") {
          setGate({ open: true, mode: "blocked", result });
          return false;
        }

        if (result.status === "adjusted") {
          setGate({
            open: true,
            mode: "adjusted",
            result,
            onProceed: () => {
              persistStockAdjustments(cart, result.orderItems);
              closeGate();
              onProceed();
            },
          });
          return false;
        }

        onProceed();
        return true;
      } catch (err) {
        setGate({
          open: true,
          mode: "blocked",
          result: {
            status: "blocked",
            lines: [],
            orderItems: [],
            messages: [
              err instanceof Error ? err.message : "재고 확인에 실패했습니다.",
            ],
          },
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [closeGate],
  );

  const confirmAdjusted = useCallback(() => {
    gate.onProceed?.();
  }, [gate]);

  return {
    gate,
    loading,
    closeGate,
    runStockGate,
    confirmAdjusted,
  };
}

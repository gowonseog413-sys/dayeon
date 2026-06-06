"use client";

import type { StockCheckResult } from "@/lib/stock-checkout";

type Props = {
  open: boolean;
  mode: "blocked" | "adjusted" | null;
  result: StockCheckResult | null;
  loading?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
};

export function StockCheckoutModal({
  open,
  mode,
  result,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!open || !mode || !result) return null;

  const title =
    mode === "blocked"
      ? "구매가 어렵습니다"
      : "재고 안내";

  const lead =
    mode === "blocked"
      ? "선택하신 상품의 재고가 없어 결제를 진행할 수 없습니다."
      : "일부 상품의 재고가 부족합니다. 아래 내용을 확인해 주세요.";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-checkout-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-[var(--pink-border)] bg-white p-6 shadow-[0_8px_32px_var(--pink-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="stock-checkout-title" className="text-base font-semibold text-[var(--pink-deep)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{lead}</p>

        <ul className="mt-4 space-y-2 rounded-xl bg-[var(--pink-bg-soft)] p-3 text-sm text-gray-700">
          {result.messages.map((msg, i) => (
            <li key={`${i}-${msg}`} className="leading-relaxed">
              · {msg}
            </li>
          ))}
        </ul>

        {mode === "adjusted" && result.orderItems.length > 0 ? (
          <p className="mt-3 text-xs text-gray-500">
            확인 시 장바구니가 조정된 수량으로 반영되며, 주문 가능한 상품만 결제 페이지로 이동합니다.
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          {mode === "adjusted" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm text-gray-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 rounded-full bg-[var(--pink-accent)] py-2.5 text-sm font-medium text-white"
              >
                {loading ? "처리 중…" : "조정 후 결제"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[var(--pink-accent)] py-2.5 text-sm font-medium text-white"
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

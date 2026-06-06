"use client";

import Link from "next/link";
import type { ShippingAddress } from "@/lib/types";
import { formatShippingLine } from "@/lib/shipping-address";

type Props = {
  open: boolean;
  shipping: ShippingAddress | null;
  onApply: () => void;
  onClose: () => void;
};

export function AddressSameModal({ open, shipping, onApply, onClose }: Props) {
  if (!open) return null;

  const hasShipping = Boolean(shipping?.address?.trim());

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-same-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border-2 border-[var(--pink-border)] bg-white p-6 shadow-[0_8px_32px_var(--pink-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="address-same-title" className="text-base font-semibold text-[var(--pink-deep)]">
          배송 주소와 동일하게 설정
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          프로필 주소를 저장된 배송 주소와 같게 맞춥니다.
        </p>

        {hasShipping && shipping ? (
          <div className="mt-4 rounded-xl border border-[var(--pink-border)] bg-[var(--pink-bg-soft)] p-4 text-sm">
            <p className="font-medium text-gray-800">{shipping.name}</p>
            <p className="mt-1 text-gray-600">{shipping.phone}</p>
            <p className="mt-2 whitespace-pre-wrap text-gray-700">{formatShippingLine(shipping)}</p>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            저장된 배송 주소가 없습니다.{" "}
            <Link href="/profile?tab=address" className="font-medium underline" onClick={onClose}>
              내 배송 주소
            </Link>
            에서 먼저 등록해 주세요.
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border-2 border-[var(--pink-border)] py-2.5 text-sm font-medium text-gray-600"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!hasShipping}
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 rounded-full bg-[var(--pink-accent)] py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            동일하게 적용
          </button>
        </div>
      </div>
    </div>
  );
}

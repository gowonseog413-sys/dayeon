"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import type { AdminUserCart } from "@/lib/types";

type Props = {
  userId: string | null;
  userName: string;
  open: boolean;
  onClose: () => void;
};

export function MemberCartModal({ userId, userName, open, onClose }: Props) {
  const [cart, setCart] = useState<AdminUserCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setError("");
    api<AdminUserCart>(`/api/admin/users/${userId}/cart`, { token: getToken() })
      .then(setCart)
      .catch((err) => {
        setCart(null);
        setError(err instanceof Error ? err.message : "장바구니를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [open, userId]);

  if (!open || !userId) return null;

  const lines = cart?.items.filter((l) => l.product) ?? [];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-cart-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-white shadow-xl sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-gray-50 px-4 py-3">
          <div>
            <h3 id="member-cart-title" className="text-base font-semibold text-gray-900">
              장바구니
            </h3>
            <p className="text-xs text-gray-500">{userName}님</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-200"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">불러오는 중…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-500">{error}</p>
          ) : !lines.length ? (
            <p className="py-8 text-center text-sm text-gray-400">장바구니가 비어 있습니다.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.id || line.productId}
                    className="flex gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-50">
                      <Image
                        src={line.product!.image}
                        alt={line.product!.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">{line.product!.brand}</p>
                      <p className="font-medium text-gray-900">{line.product!.name}</p>
                      <p className="text-sm text-[var(--pink-accent)]">
                        {formatRp(line.product!.priceSale)} × {line.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-right text-base font-semibold text-gray-900">
                합계 {formatRp(cart?.total ?? 0)}
              </p>
            </>
          )}
        </div>

        <div className="border-t px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-800 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

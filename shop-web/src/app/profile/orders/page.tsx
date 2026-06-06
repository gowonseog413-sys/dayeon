"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { NatePagination } from "@/components/NatePagination";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  canCancelOrder,
  SHOP_ORDER_PAGE_SIZE,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-display";
import { productImageFallback } from "@/lib/product-image-fallback";
import { formatOrderShippingLabel } from "@/lib/shipping-fee";
import type { Order } from "@/lib/types";

function itemImage(item: Order["items"][number]) {
  if (item.image) return item.image;
  return productImageFallback({ category: "", image: item.image || "" });
}

function ProfileOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    api<{ orders: Order[] }>("/api/orders/mine", { token })
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / SHOP_ORDER_PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);

  const pageOrders = useMemo(
    () => orders.slice((page - 1) * SHOP_ORDER_PAGE_SIZE, page * SHOP_ORDER_PAGE_SIZE),
    [orders, page],
  );

  useEffect(() => {
    if (pageParam > totalPages && totalPages >= 1 && total > 0) {
      router.replace("/profile/orders");
    }
  }, [pageParam, totalPages, total, router]);

  async function cancelOrder(id: string, orderNumber?: string) {
    const label = orderNumber || id.slice(0, 8);
    if (!confirm(`${label} 주문을 취소하시겠습니까?\n(발송 전 · 테스트 모드)`)) return;
    setCancelling(id);
    try {
      await api(`/api/orders/${id}/cancel`, {
        method: "PATCH",
        token: getToken(),
      });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "취소에 실패했습니다.");
    } finally {
      setCancelling(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">불러오는 중…</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-[var(--pink-deep)]">주문 내역</h1>
      <p className="mb-6 text-xs text-gray-500">
        최신순 · No. 역순 · {SHOP_ORDER_PAGE_SIZE}건씩 (PG 연동 전 테스트 모드)
      </p>

      {orders.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">아직 주문이 없습니다</p>
          <p className="mt-2 text-sm">주문하시면 주문 내역이 여기에서 확인됩니다.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border border-gray-300 px-6 py-2 text-sm hover:border-[var(--pink-accent)]"
          >
            쇼핑으로 돌아가기
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {pageOrders.map((o, i) => {
              const no = total - ((page - 1) * SHOP_ORDER_PAGE_SIZE + i);
              return (
                <li
                  key={o.id}
                  className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-4 shadow-[0_4px_18px_var(--pink-shadow)] sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400">No. {no}</p>
                      <Link
                        href={`/order/${o.id}?from=orders${page > 1 ? `&page=${page}` : ""}`}
                        className="text-base font-semibold text-[var(--pink-accent)] hover:underline"
                      >
                        {o.orderNumber || o.id.slice(0, 8)}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-[var(--pink-deep)]">{formatRp(o.total)}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {orderStatusLabel(o.status)} · {paymentStatusLabel(o.paymentStatus)}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-3">
                    {o.items.map((item, idx) => (
                      <li key={`${o.id}-${item.productId}-${idx}`} className="flex gap-3 text-sm">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
                          <Image
                            src={itemImage(item)}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-500">{item.brand}</p>
                          <p className="font-medium leading-tight text-gray-900">{item.name}</p>
                          <p className="mt-0.5 text-gray-600">
                            {formatRp(item.priceSale)} × {item.quantity}
                          </p>
                          <p className="text-xs font-medium text-gray-700">
                            {formatRp(item.lineTotal)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {(o.subtotal != null || o.shippingFee != null) && (
                    <div className="mt-3 space-y-0.5 border-t border-gray-50 pt-3 text-xs text-gray-500">
                      {o.subtotal != null && (
                        <p className="flex justify-between">
                          <span>소계</span>
                          <span>{formatRp(o.subtotal)}</span>
                        </p>
                      )}
                      {o.shippingFee != null && (
                        <p className="flex justify-between">
                          <span>배송비</span>
                          <span>{formatOrderShippingLabel(o.shippingFee)}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/order/${o.id}?from=orders${page > 1 ? `&page=${page}` : ""}`}
                      className="text-sm text-[var(--pink-accent)] hover:underline"
                    >
                      주문 상세
                    </Link>
                    {canCancelOrder(o) && (
                      <button
                        type="button"
                        disabled={cancelling === o.id}
                        onClick={() => cancelOrder(o.id, o.orderNumber)}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        {cancelling === o.id ? "취소 중…" : "발송 전 취소"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <NatePagination page={page} totalPages={totalPages} basePath="/profile/orders" />
        </>
      )}
    </div>
  );
}

export default function ProfileOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">불러오는 중…</p>}>
      <ProfileOrdersContent />
    </Suspense>
  );
}

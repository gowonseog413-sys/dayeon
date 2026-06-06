"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { findOrderNav } from "@/lib/order-display";
import { orderPaymentLabel } from "@/lib/payment-methods";
import { formatOrderShippingLabel } from "@/lib/shipping-fee";
import type { Order } from "@/lib/types";

function navQuery(page: string | null) {
  const params = new URLSearchParams();
  params.set("from", "orders");
  if (page && page !== "1") params.set("page", page);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listPage = searchParams.get("page");

  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    api<{ order: Order }>(`/api/orders/${id}`, { token })
      .then((d) => setOrder(d.order))
      .catch(() => setOrder(null));
    api<{ orders: Order[] }>("/api/orders/mine", { token })
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, [id]);

  const nav = useMemo(
    () => (id && orders.length ? findOrderNav(orders, id) : null),
    [id, orders],
  );

  const ordersListHref = useMemo(() => {
    const params = new URLSearchParams();
    if (listPage && listPage !== "1") params.set("page", listPage);
    const qs = params.toString();
    return qs ? `/profile/orders?${qs}` : "/profile/orders";
  }, [listPage]);

  function goPrev() {
    if (!nav) return;
    if (nav.no <= 1) {
      router.push(ordersListHref);
      return;
    }
    if (nav.prevId) {
      router.push(`/order/${nav.prevId}${navQuery(listPage)}`);
    }
  }

  function goNext() {
    if (!nav?.nextId) return;
    router.push(`/order/${nav.nextId}${navQuery(listPage)}`);
  }

  if (!order) {
    return <p className="py-20 text-center text-sm text-gray-500">주문 정보 불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {nav && nav.total > 0 && (
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--pink-border)] bg-white text-lg text-gray-700 transition hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)]"
            aria-label={nav.no <= 1 ? "주문 내역으로" : `No.${nav.no - 1} 주문`}
          >
            ‹
          </button>
          <p className="min-w-[5rem] text-sm font-semibold text-gray-600">
            No. {nav.no}
            <span className="font-normal text-gray-400"> / {nav.total}</span>
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={!nav.nextId}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--pink-border)] bg-white text-lg text-gray-700 transition hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={nav.nextId ? `No.${nav.no + 1} 주문` : "다음 주문 없음"}
          >
            ›
          </button>
        </div>
      )}

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-semibold">주문이 완료되었습니다</h1>
      <p className="mt-2 text-gray-600">
        주문번호 <strong>{order.orderNumber || order.id.slice(0, 8)}</strong>
      </p>
      {order.subtotal != null && (
        <p className="mt-4 text-sm text-gray-600">
          소계 {formatRp(order.subtotal)} · 배송비 {formatOrderShippingLabel(order.shippingFee)}
        </p>
      )}
      <p className="mt-2 text-lg font-semibold text-[var(--pink-accent)]">
        {formatRp(order.total)}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        결제: {orderPaymentLabel(order.paymentMethod)}
        {order.paymentLabel ? ` (${order.paymentLabel})` : ""} ·{" "}
        {order.paymentStatus === "paid" ? "결제 완료" : "결제 대기"}
      </p>
      {order.jubelioCode && (
        <p className="mt-1 text-xs text-gray-400">Jubelio 채널: {order.jubelioCode}</p>
      )}
      {order.shipping && (
        <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left text-sm">
          <p className="font-medium">배송지</p>
          <p className="mt-1 text-gray-600">
            {order.shipping.name} · {order.shipping.phone}
          </p>
          <p className="text-gray-600">
            {order.shipping.address}
            {order.shipping.city ? `, ${order.shipping.city}` : ""}
          </p>
        </div>
      )}
      {order.paymentMethod === "virtual_account" && (
        <p className="mt-4 rounded-lg bg-[var(--pink-bg)] p-3 text-xs text-gray-700">
          가상계좌 번호는 Jubelio에서 발급됩니다. 입금 확인 후 주문이 확정됩니다.
        </p>
      )}
      {order.paymentMethod === "gopay" && (
        <p className="mt-4 rounded-lg bg-[var(--pink-bg)] p-3 text-xs text-gray-700">
          GoPay 앱에서 결제 링크/QR을 확인해 주세요. 충전 잔액으로 결제됩니다.
        </p>
      )}
      {order.paymentMethod === "bank_transfer" && (
        <p className="mt-4 rounded-lg bg-[var(--pink-bg)] p-3 text-xs text-gray-700">
          입금 계좌 (초안): BCA 1234567890 a.n. PT Beautindo · 입금자명을 주문번호로
          기재해 주세요.
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4 text-sm">
        <Link href={ordersListHref} className="text-[var(--pink-accent)]">
          주문 내역
        </Link>
        <Link href="/" className="text-gray-600">
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-gray-500">주문 정보 불러오는 중...</p>}>
      <OrderDetailContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { orderPaymentLabel } from "@/lib/payment-methods";
import type { Order } from "@/lib/types";

export default function OrderCompletePage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    api<{ order: Order }>(`/api/orders/${id}`, { token: getToken() })
      .then((d) => setOrder(d.order))
      .catch(() => {});
  }, [id]);

  if (!order) {
    return <p className="py-20 text-center text-sm text-gray-500">주문 정보 불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-semibold">주문이 완료되었습니다</h1>
      <p className="mt-2 text-gray-600">
        주문번호 <strong>{order.orderNumber || order.id.slice(0, 8)}</strong>
      </p>
      <p className="mt-4 text-lg font-semibold text-[var(--pink-accent)]">
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
        <Link href="/account" className="text-[var(--pink-accent)]">
          주문 내역
        </Link>
        <Link href="/" className="text-gray-600">
          홈으로
        </Link>
      </div>
    </div>
  );
}

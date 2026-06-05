"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import type { Order } from "@/lib/types";

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api<{ orders: Order[] }>("/api/orders/mine", { token })
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">내 주문</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">아직 주문이 없습니다</p>
          <p className="mt-2 text-sm">
            주문하시면 Eyesight 주문 내역이 여기에서 확인됩니다.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border border-gray-300 px-6 py-2 text-sm hover:border-[var(--pink-accent)]"
          >
            쇼핑으로 돌아가기
          </Link>
        </div>
      ) : (
        <ul className="space-y-3 text-sm">
          {orders.map((o) => (
            <li key={o.id} className="rounded border border-gray-100 p-4">
              <Link href={`/order/${o.id}`} className="font-medium text-[var(--pink-accent)]">
                {o.orderNumber || o.id.slice(0, 8)}
              </Link>
              <p className="mt-1">{new Date(o.createdAt).toLocaleString("ko-KR")}</p>
              <p className="text-gray-500">
                {o.status} · Rp {o.total.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

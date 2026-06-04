"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import type { Order } from "@/lib/types";

export default function ErpOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    api<{ orders: Order[] }>("/api/admin/orders", { token: getToken() })
      .then((d) => setOrders(d.orders))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function patchOrder(id: string, body: Record<string, string>) {
    await api(`/api/admin/orders/${id}`, {
      method: "PATCH",
      token: getToken(),
      body: JSON.stringify(body),
    });
    load();
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">주문 관리</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">주문이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>{new Date(o.createdAt).toLocaleString("ko-KR")}</span>
                <span className="font-medium">Rp {o.total.toLocaleString()}</span>
              </div>
              <p className="font-medium text-[var(--pink-accent)]">
                {o.orderNumber || o.id.slice(0, 8)}
              </p>
              <p className="text-gray-500">
                {o.user?.firstName} {o.user?.email} · {o.status} · {o.paymentStatus}
              </p>
              {o.shipping && (
                <p className="text-xs text-gray-500">
                  {o.shipping.name} {o.shipping.phone} — {o.shipping.address}
                </p>
              )}
              <ul className="mt-2 text-gray-600">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.brand} {i.name} × {i.quantity}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-4">
                {o.status === "pending" && (
                  <button
                    type="button"
                    className="text-[var(--pink-accent)]"
                    onClick={() => patchOrder(o.id, { status: "completed" })}
                  >
                    배송 완료
                  </button>
                )}
                {o.paymentStatus !== "paid" && (
                  <button
                    type="button"
                    className="text-green-600"
                    onClick={() => patchOrder(o.id, { paymentStatus: "paid" })}
                  >
                    입금 확인
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

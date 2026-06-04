"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearSession, getStoredUser, getToken } from "@/lib/auth-store";
import type { Order, User } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const u = getStoredUser();
    const token = getToken();
    if (!u || !token) {
      router.replace("/login");
      return;
    }
    setUser(u);
    api<{ orders: Order[] }>("/api/orders/mine", { token })
      .then((d) => setOrders(d.orders))
      .catch(() => {});
  }, [router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-medium">내 계좌</h1>
      <p className="mt-2 text-gray-600">
        {user.firstName} {user.lastName} · {user.email}
      </p>
      {user.role === "admin" && (
        <Link href="/erp" className="mt-4 inline-block text-[var(--pink-accent)]">
          ERP 관리 페이지 →
        </Link>
      )}
      <h2 className="mt-10 mb-4 font-medium">주문 내역</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">주문 내역이 없습니다.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {orders.map((o) => (
            <li key={o.id} className="rounded border border-gray-100 p-3">
              <Link href={`/order/${o.id}`} className="font-medium text-[var(--pink-accent)]">
                {o.orderNumber || o.id.slice(0, 8)}
              </Link>
              <p>{new Date(o.createdAt).toLocaleString("ko-KR")}</p>
              <p className="text-gray-500">
                {o.status} · {o.paymentStatus || "pending"} · Rp {o.total.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="mt-8 text-sm text-gray-500 underline"
        onClick={() => {
          clearSession();
          router.push("/login");
        }}
      >
        로그아웃
      </button>
    </div>
  );
}

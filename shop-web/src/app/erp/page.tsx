"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

type Stats = {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  pendingOrders: number;
};

export default function ErpDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<{ stats?: Stats } & Stats>("/api/admin/stats", { token: getToken() })
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) {
    return <p className="text-sm text-gray-500">통계 불러오는 중... (API + admin 로그인 필요)</p>;
  }

  const cards = [
    { label: "상품", value: stats.products },
    { label: "주문", value: stats.orders },
    { label: "회원", value: stats.users },
    { label: "대기 주문", value: stats.pendingOrders },
    { label: "매출 (Rp)", value: stats.revenue.toLocaleString() },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">대시보드</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-500">
        참고 사이트:{" "}
        <a href="https://www.eyesight.co.id/" className="text-[var(--pink-accent)]" target="_blank" rel="noreferrer">
          eyesight.co.id
        </a>
      </p>
    </div>
  );
}

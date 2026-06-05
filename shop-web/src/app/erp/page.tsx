"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

type Stats = {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  pendingOrders: number;
};

const ERP_URL = "http://localhost:3010/erp";
const SHOP_URL = "http://localhost:3010";

export default function ErpDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/api/admin/stats", { token: getToken() })
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <ErpPageShell title="대시보드">
        <p className="text-sm text-gray-500">통계 불러오는 중... (API 실행 + 관리자 로그인 필요)</p>
        <p className="mt-4 text-sm">
          ERP 주소:{" "}
          <a href={ERP_URL} className="font-medium text-[var(--pink-accent)]">
            {ERP_URL}
          </a>
        </p>
      </ErpPageShell>
    );
  }

  const cards = [
    { label: "상품", value: stats.products },
    { label: "주문", value: stats.orders },
    { label: "회원", value: stats.users },
    { label: "대기 주문", value: stats.pendingOrders },
    { label: "매출 (Rp)", value: stats.revenue.toLocaleString() },
  ];

  const quick = [
    { href: "/erp/products", label: "상품 등록·수정" },
    { href: "/erp/articles", label: "언론 보도 올리기" },
    { href: "/erp/pages/about", label: "하단문서 수정" },
    { href: "/erp/pages/faq", label: "고객센터 문서 수정" },
  ];

  return (
    <ErpPageShell title="대시보드">
      <div className="mb-3 rounded-xl border border-[var(--pink-accent)]/30 bg-[var(--pink-bg)] p-3 text-sm">
        <p className="font-medium text-[var(--pink-accent)]">dayeon ERP 주소</p>
        <p className="mt-1">
          <a href={ERP_URL} className="font-mono text-gray-800 underline">
            {ERP_URL}
          </a>
        </p>
        <p className="mt-2 text-gray-600">
          쇼핑몰:{" "}
          <a href={SHOP_URL} className="text-[var(--pink-accent)]">
            {SHOP_URL}
          </a>
          {" · "}
          관리자: <code className="rounded bg-white px-1">admin@eyesight.local</code> /{" "}
          <code className="rounded bg-white px-1">admin1234</code>
        </p>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-1.5 text-sm font-semibold text-gray-700">빠른 메뉴</h3>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {quick.map((q) => (
          <li key={q.href}>
            <Link
              href={q.href}
              className="block rounded-lg border bg-white px-3 py-2 text-sm hover:border-[var(--pink-accent)]"
            >
              {q.label} →
            </Link>
          </li>
        ))}
      </ul>
    </ErpPageShell>
  );
}

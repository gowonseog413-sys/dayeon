"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpDashboardStatCard } from "@/components/erp/ErpDashboardStatCard";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";

type Stats = {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  pendingOrders: number;
};

const ERP_URL = "http://localhost:3600/erp";
const SHOP_URL = "http://localhost:3600";

export default function ErpDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getErpToken();
    if (!token) {
      setError(t("erp.dashboard.errorLogin"));
      return;
    }
    api<Stats>("/api/admin/stats", { token })
      .then(setStats)
      .catch((err) => {
        setError(err instanceof Error ? err.message : t("erp.dashboard.errorApi"));
      });
  }, [t]);

  if (!stats) {
    return (
      <ErpPageShell titleKey="erp.dashboard.title">
        {error ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          {t("erp.dashboard.shopLabel")}{" "}
          <a href={SHOP_URL} className="text-[var(--pink-accent)]">
            {SHOP_URL}
          </a>
          {" · "}
          ERP <a href={ERP_URL} className="text-[var(--pink-accent)]">{ERP_URL}</a>
          {" · "}
          API <span className="font-mono text-xs">http://localhost:3601</span>
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {t("erp.dashboard.terminalHint")}{" "}
          <code className="rounded bg-gray-100 px-1">cd shop-api; npm run dev</code>
        </p>
      </ErpPageShell>
    );
  }

  const cards = [
    {
      label: t("erp.dashboard.statProducts"),
      value: stats.products,
      href: "/erp/products/list",
      accent: "#0284c7",
    },
    {
      label: t("erp.dashboard.statOrders"),
      value: stats.orders,
      href: "/erp/orders",
      accent: "#7c3aed",
    },
    {
      label: t("erp.dashboard.statUsers"),
      value: stats.users,
      href: "/erp/users",
      accent: "#059669",
    },
    {
      label: t("erp.dashboard.statPending"),
      value: stats.pendingOrders,
      href: "/erp/orders",
      accent: "#d97706",
    },
    {
      label: t("erp.dashboard.statRevenue"),
      value: stats.revenue.toLocaleString(),
      href: "/erp/orders/stats",
      accent: "#e11d8f",
    },
  ];

  const quick = [
    { href: "/erp/stats", label: t("erp.dashboard.quickStats") },
    { href: "/erp/counter", label: t("erp.dashboard.quickCounter") },
    { href: "/erp/products", label: t("erp.dashboard.quickProducts") },
    { href: "/erp/articles", label: t("erp.dashboard.quickArticles") },
    { href: "/erp/pages/about", label: t("erp.dashboard.quickPages") },
    { href: "/erp/pages/faq", label: t("erp.dashboard.quickFaq") },
  ];

  return (
    <ErpPageShell titleKey="erp.dashboard.title">
      <div className="mb-3 rounded-xl border border-[var(--pink-accent)]/30 bg-[var(--pink-bg)] p-3 text-sm">
        <p className="font-medium text-[var(--pink-accent)]">{t("erp.dashboard.addressTitle")}</p>
        <p className="mt-1">
          <a href={ERP_URL} className="font-mono text-gray-800 underline">
            {ERP_URL}
          </a>
        </p>
        <p className="mt-2 text-gray-600">
          {t("erp.dashboard.shopLabel")}{" "}
          <a href={SHOP_URL} className="text-[var(--pink-accent)]">
            {SHOP_URL}
          </a>
          {" · "}
          {t("erp.dashboard.adminLabel")}{" "}
          <code className="rounded bg-white px-1">admin@eyesight.local</code> /{" "}
          <code className="rounded bg-white px-1">admin1234</code>
        </p>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <ErpDashboardStatCard
            key={c.href}
            href={c.href}
            label={c.label}
            value={c.value}
            accent={c.accent}
          />
        ))}
      </div>

      <h3 className="mb-1.5 text-sm font-semibold text-gray-700">{t("erp.dashboard.quickMenu")}</h3>
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

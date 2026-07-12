"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api, formatRp } from "@/lib/api";
import { analyticsCategoryLabel, type AnalyticsBoard } from "@/lib/erp-analytics";
import { getErpToken } from "@/lib/auth-store";
import { orderStatusLabel } from "@/lib/order-display";

const PERIODS = [7, 14, 30] as const;

type StatsQuery =
  | { mode: "preset"; days: (typeof PERIODS)[number] }
  | { mode: "range"; from: string; to: string };

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoInput(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-gray-900">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p> : null}
    </div>
  );
}

function periodLabel(data: AnalyticsBoard) {
  if (data.range.from === data.range.to) return data.range.from;
  return `${data.range.from} ~ ${data.range.to}`;
}

export default function ErpStatsPage() {
  const { t, tFmt, locale } = useI18n();
  const dateLocale = locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR";

  const [query, setQuery] = useState<StatsQuery>({ mode: "preset", days: 14 });
  const [customFrom, setCustomFrom] = useState(() => daysAgoInput(13));
  const [customTo, setCustomTo] = useState(todayInput);
  const [data, setData] = useState<AnalyticsBoard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        query.mode === "range"
          ? `/api/admin/analytics?from=${query.from}&to=${query.to}`
          : `/api/admin/analytics?days=${query.days}`;
      const res = await api<AnalyticsBoard>(url, { token: getErpToken() });
      setData(res);
      setError("");
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t("erp.orders.statsError"));
    } finally {
      setLoading(false);
    }
  }, [query, t]);

  useEffect(() => {
    load();
  }, [load]);

  const maxRevenue = Math.max(1, ...(data?.dailySales.map((d) => d.revenue) || [1]));
  const statusTotal = data
    ? Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0)
    : 0;

  const activePreset = query.mode === "preset" ? query.days : null;

  const statusRows = [
    { key: "pending" as const, labelKey: "erp.orders.statusPending", color: "#d97706" },
    { key: "shipped" as const, labelKey: "erp.orders.statusShipped", color: "#0284c7" },
    { key: "completed" as const, labelKey: "erp.orders.statusCompleted", color: "#16a34a" },
    { key: "cancelled" as const, labelKey: "erp.orders.statusCancelled", color: "#9ca3af" },
  ];

  return (
    <ErpPageShell titleKey="erp.nav.stats" descriptionKey="erp.stats.desc">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex gap-1 rounded-lg border bg-white p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuery({ mode: "preset", days: p })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activePreset === p
                    ? "bg-[#8b5e4c] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tFmt("erp.orders.recentDays", { days: p })}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white px-2 py-1.5">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded border border-gray-200 px-2 py-1 text-xs"
              aria-label={t("erp.orders.dateFrom")}
            />
            <span className="text-xs text-gray-400">~</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded border border-gray-200 px-2 py-1 text-xs"
              aria-label={t("erp.orders.dateTo")}
            />
            <button
              type="button"
              onClick={() => {
                if (!customFrom || !customTo) return;
                setQuery({ mode: "range", from: customFrom, to: customTo });
              }}
              disabled={loading || !customFrom || !customTo}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                query.mode === "range"
                  ? "bg-[#8b5e4c] text-white"
                  : "border border-[#8b5e4c] text-[#8b5e4c] hover:bg-[#faf6f0]"
              }`}
            >
              {loading && query.mode === "range" ? t("erp.orders.querying") : t("erp.orders.query")}
            </button>
          </div>
        </div>

        <Link href="/erp/counter" className="text-xs text-[#8b5e4c] hover:underline">
          {t("erp.stats.linkCounter")}
        </Link>
      </div>

      {data && (
        <p className="mb-3 text-xs text-gray-500">
          {t("erp.orders.periodLabel")}{" "}
          <span className="font-medium text-gray-700">{periodLabel(data)}</span>
          {query.mode === "range"
            ? ` ${t("erp.orders.periodCustom")}`
            : ` ${tFmt("erp.orders.periodRecent", { days: data.periodDays })}`}
        </p>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
      )}

      {!data ? (
        <p className="text-sm text-gray-500">
          {loading ? t("erp.orders.statsLoading") : t("erp.orders.noData")}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t("erp.orders.periodRevenue")}
              value={formatRp(data.overview.revenue)}
              sub={periodLabel(data)}
            />
            <StatCard
              label={t("erp.orders.periodOrders")}
              value={tFmt("erp.orders.countUnit", { count: data.overview.orders })}
              sub={tFmt("erp.orders.avgOrder", { amount: formatRp(data.overview.avgOrderValue) })}
            />
            <StatCard
              label={t("erp.stats.todayRevenue")}
              value={formatRp(data.overview.todayRevenue)}
              sub={tFmt("erp.stats.todayOrdersSub", { count: data.overview.todayOrders })}
            />
            <StatCard
              label={t("erp.stats.monthRevenue")}
              value={formatRp(data.overview.monthRevenue)}
              sub={tFmt("erp.stats.monthOrdersSub", { count: data.overview.monthOrders })}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.stats.dailyRevenue")}</h3>
              <div className="flex h-44 items-end gap-1 overflow-x-auto border-b border-gray-100 pb-1">
                {data.dailySales.map((d) => {
                  const h = Math.max(4, Math.round((d.revenue / maxRevenue) * 100));
                  return (
                    <div
                      key={d.date}
                      className="group flex min-w-[1.75rem] flex-1 flex-col items-center justify-end"
                      title={`${d.date} · ${formatRp(d.revenue)} · ${tFmt("erp.orders.countUnit", { count: d.orders })}`}
                    >
                      <div
                        className="w-full max-w-[2rem] rounded-t bg-[#8b5e4c]/85 transition group-hover:bg-[#8b5e4c]"
                        style={{ height: `${h}%` }}
                      />
                      <span className="mt-1 truncate text-[9px] text-gray-400">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.stats.orderStatus")}</h3>
              <ul className="space-y-2">
                {statusRows.map(({ key, labelKey, color }) => {
                  const count = data.ordersByStatus[key];
                  const pct = statusTotal ? Math.round((count / statusTotal) * 100) : 0;
                  return (
                    <li key={key}>
                      <div className="mb-0.5 flex justify-between text-xs">
                        <span className="text-gray-600">{t(labelKey)}</span>
                        <span className="font-medium text-gray-800">
                          {tFmt("erp.orders.statusCount", { count, pct })}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.orders.topProducts")}</h3>
              {data.topProducts.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">{t("erp.orders.noSalesData")}</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">{t("erp.orders.colProduct")}</th>
                      <th className="pb-2 text-right font-medium">{t("erp.orders.colQty")}</th>
                      <th className="pb-2 text-right font-medium">{t("erp.orders.colRevenue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p) => (
                      <tr key={p.productId || p.name} className="border-b border-gray-50">
                        <td className="py-2 pr-2">
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.brand}</p>
                        </td>
                        <td className="py-2 text-right text-gray-700">{p.quantity}</td>
                        <td className="py-2 text-right font-medium text-[#8b5e4c]">
                          {formatRp(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.orders.categorySales")}</h3>
              {data.categorySales.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">{t("erp.orders.noData")}</p>
              ) : (
                <ul className="space-y-2">
                  {data.categorySales.map((c) => {
                    const max = data.categorySales[0]?.amount || 1;
                    const pct = Math.round((c.amount / max) * 100);
                    return (
                      <li key={c.category}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span className="text-gray-600">
                            {analyticsCategoryLabel(c.category, locale)}
                          </span>
                          <span className="font-medium">{formatRp(c.amount)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#8b5e4c]/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3">
                <StatCard
                  label={t("erp.stats.registeredProducts")}
                  value={tFmt("erp.stats.productCount", { count: data.overview.products })}
                />
                <StatCard
                  label={t("erp.stats.newMembers")}
                  value={tFmt("erp.permissions.countSuffix", { count: data.overview.newMembers })}
                  sub={tFmt("erp.stats.newMembersSub", { total: data.overview.members })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.orders.recentOrders")}</h3>
            {data.recentOrders.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400">{t("erp.stats.noOrdersInPeriod")}</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">{t("erp.orders.colOrderNo")}</th>
                    <th className="pb-2 font-medium">{t("erp.orders.colDateTime")}</th>
                    <th className="pb-2 font-medium">{t("erp.orders.colStatus")}</th>
                    <th className="pb-2 text-right font-medium">{t("erp.orders.colAmount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50">
                      <td className="py-2 font-mono text-gray-800">
                        {o.orderNumber || o.id.slice(0, 8)}
                      </td>
                      <td className="py-2 text-gray-600">
                        {new Date(o.createdAt).toLocaleString(dateLocale)}
                      </td>
                      <td className="py-2 text-gray-600">{orderStatusLabel(o.status, locale)}</td>
                      <td className="py-2 text-right font-medium">{formatRp(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </ErpPageShell>
  );
}

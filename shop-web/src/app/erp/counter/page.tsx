"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api, formatRp } from "@/lib/api";
import { type CounterReport } from "@/lib/erp-analytics";
import { getErpToken } from "@/lib/auth-store";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/order-display";

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function CounterCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 shadow-sm ${
        accent
          ? "border-[#8b5e4c]/40 bg-[#faf6f0]"
          : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 text-xl font-semibold ${accent ? "text-[#8b5e4c]" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

export default function ErpCounterPage() {
  const { t, tFmt, locale } = useI18n();
  const dateLocale = locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR";

  const [from, setFrom] = useState(todayInput());
  const [to, setTo] = useState(todayInput());
  const [data, setData] = useState<CounterReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<CounterReport>(
        `/api/admin/counter?from=${from}&to=${to}`,
        { token: getErpToken() },
      );
      setData(res);
      setError("");
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t("erp.counter.queryFailed"));
    } finally {
      setLoading(false);
    }
  }, [from, to, t]);

  useEffect(() => {
    load();
  }, [load]);

  const maxHourly = Math.max(1, ...(data?.hourly.map((h) => h.revenue) || [1]));
  const isSingleDay = from === to;

  return (
    <ErpPageShell titleKey="erp.nav.counter" descriptionKey="erp.counter.desc">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-600">{t("erp.orders.dateFrom")}</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-600">{t("erp.orders.dateTo")}</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const today = todayInput();
              setFrom(today);
              setTo(today);
            }}
            className="rounded-full border border-[#8b5e4c] px-4 py-2 text-xs font-medium text-[#8b5e4c] hover:bg-[#faf6f0]"
          >
            {t("erp.counter.today")}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-full bg-[#8b5e4c] px-5 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {loading ? t("erp.orders.querying") : t("erp.orders.query")}
          </button>
        </div>
        <Link href="/erp/stats" className="text-xs text-[#8b5e4c] hover:underline">
          {t("erp.counter.linkStats")}
        </Link>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
      )}

      {!data ? (
        <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {t("erp.orders.periodLabel")}{" "}
            <strong>{data.range.from}</strong>
            {data.range.from !== data.range.to ? (
              <>
                {" ~ "}
                <strong>{data.range.to}</strong>
              </>
            ) : null}
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <CounterCard
              label={t("erp.counter.orderCount")}
              value={tFmt("erp.orders.countUnit", { count: data.summary.orders })}
              accent
            />
            <CounterCard label={t("erp.counter.revenueTotal")} value={formatRp(data.summary.revenue)} accent />
            <CounterCard
              label={t("erp.counter.itemQty")}
              value={tFmt("erp.counter.itemQtyUnit", { count: data.summary.itemQty })}
            />
            <CounterCard label={t("erp.counter.avgOrderValue")} value={formatRp(data.summary.avgOrderValue)} />
            <CounterCard
              label={t("erp.counter.cancelledCount")}
              value={tFmt("erp.orders.countUnit", { count: data.summary.cancelled })}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <CounterCard label={t("erp.counter.monthRevenue")} value={formatRp(data.summary.monthRevenue)} />
            <CounterCard
              label={t("erp.counter.monthOrders")}
              value={tFmt("erp.orders.countUnit", { count: data.summary.monthOrders })}
            />
          </div>

          {isSingleDay && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.counter.hourlyCounter")}</h3>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-12">
                {data.hourly.map((h) => {
                  const active = h.orders > 0;
                  const intensity = active ? Math.max(0.25, h.revenue / maxHourly) : 0;
                  return (
                    <div
                      key={h.hour}
                      title={`${h.label} · ${tFmt("erp.orders.countUnit", { count: h.orders })} · ${formatRp(h.revenue)}`}
                      className="rounded-lg border border-gray-100 p-2 text-center"
                      style={{
                        backgroundColor: active
                          ? `rgba(139, 94, 76, ${0.12 + intensity * 0.55})`
                          : undefined,
                      }}
                    >
                      <p className="text-[10px] text-gray-500">{h.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{h.orders}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isSingleDay && data.dailyBreakdown.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">{t("erp.counter.dailyCounter")}</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">{t("erp.counter.colDate")}</th>
                    <th className="pb-2 text-right font-medium">{t("erp.counter.colOrders")}</th>
                    <th className="pb-2 text-right font-medium">{t("erp.counter.colQty")}</th>
                    <th className="pb-2 text-right font-medium">{t("erp.counter.colRevenue")}</th>
                    <th className="pb-2 text-right font-medium">{t("erp.counter.colCancelled")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyBreakdown.map((d) => (
                    <tr key={d.date} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-800">{d.date}</td>
                      <td className="py-2 text-right">{tFmt("erp.orders.countUnit", { count: d.orders })}</td>
                      <td className="py-2 text-right">{tFmt("erp.counter.itemQtyUnit", { count: d.itemQty })}</td>
                      <td className="py-2 text-right font-medium text-[#8b5e4c]">
                        {formatRp(d.revenue)}
                      </td>
                      <td className="py-2 text-right text-gray-400">
                        {tFmt("erp.orders.countUnit", { count: d.cancelled })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              {tFmt("erp.counter.orderHistory", { count: data.orders.length })}
            </h3>
            {data.orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{t("erp.counter.noOrders")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-xs">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">{t("erp.counter.colTime")}</th>
                      <th className="pb-2 font-medium">{t("erp.orders.colOrderNo")}</th>
                      <th className="pb-2 font-medium">{t("erp.counter.colCustomer")}</th>
                      <th className="pb-2 text-right font-medium">{t("erp.orders.colQty")}</th>
                      <th className="pb-2 font-medium">{t("erp.counter.colPayment")}</th>
                      <th className="pb-2 font-medium">{t("erp.orders.colStatus")}</th>
                      <th className="pb-2 text-right font-medium">{t("erp.orders.colAmount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                        <td className="py-2 text-gray-600">
                          {new Date(o.createdAt).toLocaleString(dateLocale, {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2 font-mono text-gray-800">
                          {o.orderNumber || o.id.slice(0, 8)}
                        </td>
                        <td className="py-2 text-gray-700">{o.customerName}</td>
                        <td className="py-2 text-right">{o.itemQty}</td>
                        <td className="py-2 text-gray-600">
                          {paymentStatusLabel(o.paymentStatus, locale)}
                        </td>
                        <td className="py-2 text-gray-600">{orderStatusLabel(o.status, locale)}</td>
                        <td className="py-2 text-right font-semibold text-[#8b5e4c]">
                          {formatRp(o.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-[#faf6f0]/60 font-semibold">
                      <td colSpan={6} className="py-2.5 pl-1 text-gray-700">
                        {t("erp.counter.total")}
                      </td>
                      <td className="py-2.5 text-right text-[#8b5e4c]">
                        {formatRp(data.summary.revenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </ErpPageShell>
  );
}

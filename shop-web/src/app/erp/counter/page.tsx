"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api, formatRp } from "@/lib/api";
import { type CounterReport } from "@/lib/erp-analytics";
import { getToken } from "@/lib/auth-store";
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
        { token: getToken() },
      );
      setData(res);
      setError("");
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "조회 실패");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const maxHourly = Math.max(1, ...(data?.hourly.map((h) => h.revenue) || [1]));
  const isSingleDay = from === to;

  return (
    <ErpPageShell
      title="카운터조회"
      description="일자별·시간대별 주문 건수와 매출을 카운터 형태로 조회합니다."
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-600">시작일</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-600">종료일</span>
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
              const t = todayInput();
              setFrom(t);
              setTo(t);
            }}
            className="rounded-full border border-[#8b5e4c] px-4 py-2 text-xs font-medium text-[#8b5e4c] hover:bg-[#faf6f0]"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-full bg-[#8b5e4c] px-5 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {loading ? "조회 중…" : "조회"}
          </button>
        </div>
        <Link href="/erp/stats" className="text-xs text-[#8b5e4c] hover:underline">
          통계보드 →
        </Link>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
      )}

      {!data ? (
        <p className="text-sm text-gray-500">불러오는 중…</p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            조회 기간: <strong>{data.range.from}</strong>
            {data.range.from !== data.range.to ? (
              <>
                {" ~ "}
                <strong>{data.range.to}</strong>
              </>
            ) : null}
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <CounterCard label="주문 건수" value={`${data.summary.orders}건`} accent />
            <CounterCard label="매출 합계" value={formatRp(data.summary.revenue)} accent />
            <CounterCard label="판매 수량" value={`${data.summary.itemQty}개`} />
            <CounterCard label="평균 객단가" value={formatRp(data.summary.avgOrderValue)} />
            <CounterCard label="취소 건수" value={`${data.summary.cancelled}건`} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <CounterCard
              label="당월 누적 매출"
              value={formatRp(data.summary.monthRevenue)}
            />
            <CounterCard
              label="당월 누적 주문"
              value={`${data.summary.monthOrders}건`}
            />
          </div>

          {isSingleDay && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">시간대별 카운터</h3>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-12">
                {data.hourly.map((h) => {
                  const active = h.orders > 0;
                  const intensity = active ? Math.max(0.25, h.revenue / maxHourly) : 0;
                  return (
                    <div
                      key={h.hour}
                      title={`${h.label} · ${h.orders}건 · ${formatRp(h.revenue)}`}
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
              <h3 className="mb-3 text-sm font-semibold text-gray-800">일별 카운터</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">날짜</th>
                    <th className="pb-2 text-right font-medium">주문</th>
                    <th className="pb-2 text-right font-medium">수량</th>
                    <th className="pb-2 text-right font-medium">매출</th>
                    <th className="pb-2 text-right font-medium">취소</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyBreakdown.map((d) => (
                    <tr key={d.date} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-800">{d.date}</td>
                      <td className="py-2 text-right">{d.orders}건</td>
                      <td className="py-2 text-right">{d.itemQty}개</td>
                      <td className="py-2 text-right font-medium text-[#8b5e4c]">
                        {formatRp(d.revenue)}
                      </td>
                      <td className="py-2 text-right text-gray-400">{d.cancelled}건</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              주문 내역 ({data.orders.length}건)
            </h3>
            {data.orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">해당 기간 주문이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-xs">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">시간</th>
                      <th className="pb-2 font-medium">주문번호</th>
                      <th className="pb-2 font-medium">고객</th>
                      <th className="pb-2 text-right font-medium">수량</th>
                      <th className="pb-2 font-medium">결제</th>
                      <th className="pb-2 font-medium">상태</th>
                      <th className="pb-2 text-right font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                        <td className="py-2 text-gray-600">
                          {new Date(o.createdAt).toLocaleString("ko-KR", {
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
                          {paymentStatusLabel(o.paymentStatus)}
                        </td>
                        <td className="py-2 text-gray-600">{orderStatusLabel(o.status)}</td>
                        <td className="py-2 text-right font-semibold text-[#8b5e4c]">
                          {formatRp(o.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-[#faf6f0]/60 font-semibold">
                      <td colSpan={6} className="py-2.5 pl-1 text-gray-700">
                        합계
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

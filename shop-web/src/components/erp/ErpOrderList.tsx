"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  canCancelOrder,
  ERP_ORDER_PAGE_SIZE,
  erpOrderTabDescription,
  orderStatusLabel,
  paymentStatusLabel,
  returnStatusLabel,
  TRACKING_CARRIERS,
  type ErpOrderTab,
} from "@/lib/order-display";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { Order } from "@/lib/types";

type TabCounts = {
  incoming: number;
  shipping: number;
  returns: number;
  closed: number;
  cancelled: number;
  total: number;
};

type Props = {
  tab: ErpOrderTab;
  basePath: string;
  title: string;
};

function itemImage(item: Order["items"][number]) {
  if (item.image) return item.image;
  return productImageFallback({ category: "", image: item.image || "" });
}

export function ErpOrderList({ tab, basePath, title }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [orders, setOrders] = useState<Order[]>([]);
  const [tabCounts, setTabCounts] = useState<TabCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<
    Record<string, { carrier: string; number: string }>
  >({});
  const { showSaveSuccess } = useErpSaveSuccess();

  const load = useCallback(() => {
    setLoading(true);
    api<{ orders: Order[]; tabCounts: TabCounts }>(
      `/api/admin/orders?tab=${tab}`,
      { token: getToken() },
    )
      .then((d) => {
        setOrders(d.orders);
        setTabCounts(d.tabCounts);
        const drafts: Record<string, { carrier: string; number: string }> = {};
        for (const o of d.orders) {
          drafts[o.id] = {
            carrier: o.trackingCarrier || "",
            number: o.trackingNumber || "",
          };
        }
        setTrackingDraft(drafts);
      })
      .catch(() => {
        setOrders([]);
        setTabCounts(null);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / ERP_ORDER_PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);

  const pageOrders = useMemo(
    () => orders.slice((page - 1) * ERP_ORDER_PAGE_SIZE, page * ERP_ORDER_PAGE_SIZE),
    [orders, page],
  );

  useEffect(() => {
    if (pageParam > totalPages && totalPages >= 1 && total > 0) {
      router.replace(basePath);
    }
  }, [pageParam, totalPages, total, router, basePath]);

  async function patchOrder(id: string, body: Record<string, string>) {
    setBusy(id);
    try {
      await api(`/api/admin/orders/${id}`, {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify(body),
      });
      load();
      if (body.trackingCarrier !== undefined || body.trackingNumber !== undefined) {
        showSaveSuccess({ subMessage: "추적 정보가 반영되었습니다." });
      } else if (body.status === "shipped") {
        showSaveSuccess({ subMessage: "배송 처리가 완료되었습니다." });
      } else {
        showSaveSuccess({ subMessage: "주문 상태가 업데이트되었습니다." });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "처리 실패");
    } finally {
      setBusy(null);
    }
  }

  async function shipWithTracking(order: Order) {
    const draft = trackingDraft[order.id] || { carrier: "", number: "" };
    await patchOrder(order.id, {
      status: "shipped",
      trackingCarrier: draft.carrier,
      trackingNumber: draft.number,
    });
  }

  async function saveTracking(order: Order) {
    const draft = trackingDraft[order.id] || { carrier: "", number: "" };
    await patchOrder(order.id, {
      trackingCarrier: draft.carrier,
      trackingNumber: draft.number,
    });
  }

  async function requestReturn(order: Order) {
    const reason = prompt("반품 사유를 입력하세요 (선택)");
    if (reason === null) return;
    await patchOrder(order.id, {
      returnStatus: "requested",
      returnReason: reason,
    });
  }

  if (loading) {
    return (
      <ErpPageShell title={title}>
        <p className="text-sm text-gray-500">불러오는 중…</p>
      </ErpPageShell>
    );
  }

  const countLine = tabCounts
    ? `접수 ${tabCounts.incoming} · 배송 ${tabCounts.shipping} · 반품 ${tabCounts.returns} · 마감 ${tabCounts.closed}`
    : "";

  return (
    <ErpPageShell
      title={title}
      description={`${erpOrderTabDescription(tab)} · PG 테스트 모드 · ${ERP_ORDER_PAGE_SIZE}건씩`}
    >
      {tabCounts ? (
        <p className="mb-2 text-xs text-gray-400">전체 현황 — {countLine}</p>
      ) : null}

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">해당 조건의 주문이 없습니다.</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-gray-500">
            총 {total}건 · 최신순 · No. 역순 · {ERP_ORDER_PAGE_SIZE}건씩
          </p>
          <ul className="space-y-3">
            {pageOrders.map((o, i) => {
              const no = total - ((page - 1) * ERP_ORDER_PAGE_SIZE + i);
              const draft = trackingDraft[o.id] || {
                carrier: o.trackingCarrier || "",
                number: o.trackingNumber || "",
              };
              return (
                <li key={o.id} className="rounded-xl border bg-white p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400">No. {no}</p>
                      <p className="font-semibold text-[var(--pink-accent)]">
                        {o.orderNumber || o.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <p className="font-semibold">{formatRp(o.total)}</p>
                  </div>
                  <p className="mt-1 text-gray-600">
                    {o.user?.firstName} {o.user?.lastName} · {o.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {orderStatusLabel(o.status)} · {paymentStatusLabel(o.paymentStatus)}
                    {o.returnStatus ? ` · ${returnStatusLabel(o.returnStatus)}` : ""}
                  </p>
                  {o.shipping && (
                    <p className="mt-1 text-xs text-gray-500">
                      {o.shipping.name} {o.shipping.phone} — {o.shipping.address}
                    </p>
                  )}
                  <ul className="mt-3 space-y-2">
                    {o.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border bg-gray-50">
                          <Image
                            src={itemImage(item)}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {item.brand} {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRp(item.priceSale)} × {item.quantity} ={" "}
                            {formatRp(item.lineTotal)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {(tab === "shipping" || (tab === "incoming" && o.status === "pending")) && (
                    <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-3">
                      <label className="text-xs">
                        <span className="mb-1 block text-gray-500">택배사</span>
                        <select
                          value={draft.carrier}
                          onChange={(e) =>
                            setTrackingDraft((prev) => ({
                              ...prev,
                              [o.id]: { ...draft, carrier: e.target.value },
                            }))
                          }
                          className="rounded border px-2 py-1.5 text-sm"
                        >
                          <option value="">선택</option>
                          {TRACKING_CARRIERS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="min-w-[10rem] flex-1 text-xs">
                        <span className="mb-1 block text-gray-500">운송장 번호</span>
                        <input
                          type="text"
                          value={draft.number}
                          onChange={(e) =>
                            setTrackingDraft((prev) => ({
                              ...prev,
                              [o.id]: { ...draft, number: e.target.value },
                            }))
                          }
                          placeholder="추적 번호"
                          className="w-full rounded border px-2 py-1.5 text-sm"
                        />
                      </label>
                    </div>
                  )}

                  {tab === "shipping" && o.trackingNumber && (
                    <p className="mt-2 text-xs text-blue-700">
                      배송 추적: {o.trackingCarrier || "택배"} · {o.trackingNumber}
                    </p>
                  )}

                  {o.status === "shipped" && o.shippedAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      발송일 {new Date(o.shippedAt).toLocaleString("ko-KR")}
                      {o.autoCompleted ? " · 자동 배송완료" : " · 영업일 5일 후 자동 배송완료"}
                    </p>
                  )}

                  {o.completedAt && tab === "closed" && (
                    <p className="mt-2 text-xs text-gray-500">
                      배송완료 {new Date(o.completedAt).toLocaleString("ko-KR")}
                      {o.returnStatus === "completed"
                        ? ` · 반품완료 ${o.returnCompletedAt ? new Date(o.returnCompletedAt).toLocaleString("ko-KR") : ""}`
                        : ""}
                      {o.returnStatus === "rejected" ? " · 반품 거절 이력" : ""}
                    </p>
                  )}

                  {tab === "returns" && o.returnReason && (
                    <p className="mt-2 text-xs text-amber-800">사유: {o.returnReason}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4">
                    {tab === "incoming" && o.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-blue-600 disabled:opacity-50"
                          onClick={() => shipWithTracking(o)}
                        >
                          발송 처리 → 주문배송
                        </button>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-[var(--pink-accent)] disabled:opacity-50"
                          onClick={() => patchOrder(o.id, { status: "completed" })}
                        >
                          배송 완료 처리
                        </button>
                      </>
                    )}

                    {tab === "shipping" && o.status === "shipped" && (
                      <>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-blue-600 disabled:opacity-50"
                          onClick={() => saveTracking(o)}
                        >
                          추적 정보 저장
                        </button>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-[var(--pink-accent)] disabled:opacity-50"
                          onClick={() => patchOrder(o.id, { status: "completed" })}
                        >
                          배송 완료 → 최종마감
                        </button>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-amber-700 disabled:opacity-50"
                          onClick={() => requestReturn(o)}
                        >
                          반품 접수
                        </button>
                      </>
                    )}

                    {tab === "returns" && (
                      <>
                        {o.returnStatus === "requested" && (
                          <button
                            type="button"
                            disabled={busy === o.id}
                            className="text-blue-600 disabled:opacity-50"
                            onClick={() => patchOrder(o.id, { returnStatus: "approved" })}
                          >
                            반품 승인
                          </button>
                        )}
                        {(o.returnStatus === "requested" || o.returnStatus === "approved") && (
                          <button
                            type="button"
                            disabled={busy === o.id}
                            className="text-[var(--pink-accent)] disabled:opacity-50"
                            onClick={() => patchOrder(o.id, { returnStatus: "completed" })}
                          >
                            반품 완료
                          </button>
                        )}
                        {(o.returnStatus === "requested" || o.returnStatus === "approved") && (
                          <button
                            type="button"
                            disabled={busy === o.id}
                            className="text-red-600 disabled:opacity-50"
                            onClick={() => patchOrder(o.id, { returnStatus: "rejected" })}
                          >
                            반품 거절
                          </button>
                        )}
                      </>
                    )}

                    {tab === "closed" && !o.returnStatus && (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        className="text-amber-700 disabled:opacity-50"
                        onClick={() => requestReturn(o)}
                      >
                        반품 접수
                      </button>
                    )}

                    {o.paymentStatus !== "paid" && o.status !== "cancelled" && tab === "incoming" && (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        className="text-green-600 disabled:opacity-50"
                        onClick={() => patchOrder(o.id, { paymentStatus: "paid" })}
                      >
                        입금 확인 (테스트)
                      </button>
                    )}

                    {canCancelOrder(o) && tab === "incoming" && (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        className="text-red-600 disabled:opacity-50"
                        onClick={() => {
                          if (!confirm("발송 전 주문을 취소하시겠습니까?")) return;
                          patchOrder(o.id, { status: "cancelled" });
                        }}
                      >
                        발송 전 취소
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <NatePagination page={page} totalPages={totalPages} basePath={basePath} />
        </>
      )}
    </ErpPageShell>
  );
}

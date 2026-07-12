"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { useI18n } from "@/components/I18nProvider";
import { NatePagination } from "@/components/NatePagination";
import { api, formatRp } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  canCancelOrder,
  ERP_ORDER_PAGE_SIZE,
  orderStatusLabel,
  paymentStatusLabel,
  returnStatusLabel,
  TRACKING_CARRIERS,
  trackingCarrierLabel,
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
  titleKey: string;
};

function itemImage(item: Order["items"][number]) {
  if (item.image) return item.image;
  return productImageFallback({ category: "", image: item.image || "" });
}

export function ErpOrderList({ tab, basePath, titleKey }: Props) {
  const { t, tFmt, locale } = useI18n();
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

  const dateLocale = locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR";

  const load = useCallback(() => {
    setLoading(true);
    api<{ orders: Order[]; tabCounts: TabCounts }>(
      `/api/admin/orders?tab=${tab}`,
      { token: getErpToken() },
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
        token: getErpToken(),
        body: JSON.stringify(body),
      });
      load();
      if (body.trackingCarrier !== undefined || body.trackingNumber !== undefined) {
        showSaveSuccess({ subMessage: t("erp.orders.saveTrackingSuccess") });
      } else if (body.status === "shipped") {
        showSaveSuccess({ subMessage: t("erp.orders.shipSuccess") });
      } else {
        showSaveSuccess({ subMessage: t("erp.orders.statusUpdated") });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t("erp.orders.actionFailed"));
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
    const reason = prompt(t("erp.orders.returnReasonPrompt"));
    if (reason === null) return;
    await patchOrder(order.id, {
      returnStatus: "requested",
      returnReason: reason,
    });
  }

  const tabDescKey = `erp.orders.tabDesc.${tab}` as const;
  const description = `${t(tabDescKey)} · ${t("erp.orders.descPgTest")} · ${tFmt("erp.orders.descPageSize", { size: ERP_ORDER_PAGE_SIZE })}`;

  if (loading) {
    return (
      <ErpPageShell titleKey={titleKey}>
        <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
      </ErpPageShell>
    );
  }

  const countLine = tabCounts
    ? tFmt("erp.orders.summaryCounts", {
        incoming: tabCounts.incoming,
        shipping: tabCounts.shipping,
        returns: tabCounts.returns,
        closed: tabCounts.closed,
      })
    : "";

  return (
    <ErpPageShell titleKey={titleKey} description={description}>
      {tabCounts ? (
        <p className="mb-2 text-xs text-gray-400">
          {tFmt("erp.orders.overallStatus", { counts: countLine })}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">{t("erp.orders.noMatching")}</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-gray-500">
            {tFmt("erp.orders.listMeta", { total, size: ERP_ORDER_PAGE_SIZE })}
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
                      <p className="text-xs text-gray-400">{tFmt("erp.orders.itemNo", { no })}</p>
                      <p className="font-semibold text-[var(--pink-accent)]">
                        {o.orderNumber || o.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString(dateLocale)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatRp(o.total)}</p>
                  </div>
                  <p className="mt-1 text-gray-600">
                    {o.user?.firstName} {o.user?.lastName} · {o.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {orderStatusLabel(o.status, locale)} · {paymentStatusLabel(o.paymentStatus, locale)}
                    {o.returnStatus ? ` · ${returnStatusLabel(o.returnStatus, locale)}` : ""}
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
                        <span className="mb-1 block text-gray-500">{t("erp.orders.carrier")}</span>
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
                          <option value="">{t("erp.orders.carrierSelect")}</option>
                          {TRACKING_CARRIERS.map((c) => (
                            <option key={c} value={c}>
                              {trackingCarrierLabel(c, locale)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="min-w-[10rem] flex-1 text-xs">
                        <span className="mb-1 block text-gray-500">{t("erp.orders.trackingNo")}</span>
                        <input
                          type="text"
                          value={draft.number}
                          onChange={(e) =>
                            setTrackingDraft((prev) => ({
                              ...prev,
                              [o.id]: { ...draft, number: e.target.value },
                            }))
                          }
                          placeholder={t("erp.orders.trackingPlaceholder")}
                          className="w-full rounded border px-2 py-1.5 text-sm"
                        />
                      </label>
                    </div>
                  )}

                  {tab === "shipping" && o.trackingNumber && (
                    <p className="mt-2 text-xs text-blue-700">
                      {tFmt("erp.orders.trackingInfo", {
                        carrier: o.trackingCarrier || t("erp.orders.carrierDefault"),
                        number: o.trackingNumber,
                      })}
                    </p>
                  )}

                  {o.status === "shipped" && o.shippedAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      {tFmt("erp.orders.shippedAt", {
                        date: new Date(o.shippedAt).toLocaleString(dateLocale),
                      })}
                      {o.autoCompleted
                        ? ` · ${t("erp.orders.autoCompleted")}`
                        : ` · ${t("erp.orders.autoCompleteAfter")}`}
                    </p>
                  )}

                  {o.completedAt && tab === "closed" && (
                    <p className="mt-2 text-xs text-gray-500">
                      {tFmt("erp.orders.completedAt", {
                        date: new Date(o.completedAt).toLocaleString(dateLocale),
                      })}
                      {o.returnStatus === "completed"
                        ? ` · ${tFmt("erp.orders.returnCompletedAt", {
                            date: o.returnCompletedAt
                              ? new Date(o.returnCompletedAt).toLocaleString(dateLocale)
                              : "",
                          })}`
                        : ""}
                      {o.returnStatus === "rejected" ? ` · ${t("erp.orders.returnRejectedHistory")}` : ""}
                    </p>
                  )}

                  {tab === "returns" && o.returnReason && (
                    <p className="mt-2 text-xs text-amber-800">
                      {tFmt("erp.orders.returnReason", { reason: o.returnReason })}
                    </p>
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
                          {t("erp.orders.btnShipToShipping")}
                        </button>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-[var(--pink-accent)] disabled:opacity-50"
                          onClick={() => patchOrder(o.id, { status: "completed" })}
                        >
                          {t("erp.orders.btnCompleteDelivery")}
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
                          {t("erp.orders.btnSaveTracking")}
                        </button>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-[var(--pink-accent)] disabled:opacity-50"
                          onClick={() => patchOrder(o.id, { status: "completed" })}
                        >
                          {t("erp.orders.btnCompleteToClosed")}
                        </button>
                        <button
                          type="button"
                          disabled={busy === o.id}
                          className="text-amber-700 disabled:opacity-50"
                          onClick={() => requestReturn(o)}
                        >
                          {t("erp.orders.btnReturnRequest")}
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
                            {t("erp.orders.btnReturnApprove")}
                          </button>
                        )}
                        {(o.returnStatus === "requested" || o.returnStatus === "approved") && (
                          <button
                            type="button"
                            disabled={busy === o.id}
                            className="text-[var(--pink-accent)] disabled:opacity-50"
                            onClick={() => patchOrder(o.id, { returnStatus: "completed" })}
                          >
                            {t("erp.orders.btnReturnComplete")}
                          </button>
                        )}
                        {(o.returnStatus === "requested" || o.returnStatus === "approved") && (
                          <button
                            type="button"
                            disabled={busy === o.id}
                            className="text-red-600 disabled:opacity-50"
                            onClick={() => patchOrder(o.id, { returnStatus: "rejected" })}
                          >
                            {t("erp.orders.btnReturnReject")}
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
                        {t("erp.orders.btnReturnRequest")}
                      </button>
                    )}

                    {o.paymentStatus !== "paid" && o.status !== "cancelled" && tab === "incoming" && (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        className="text-green-600 disabled:opacity-50"
                        onClick={() => patchOrder(o.id, { paymentStatus: "paid" })}
                      >
                        {t("erp.orders.btnConfirmPayment")}
                      </button>
                    )}

                    {canCancelOrder(o) && tab === "incoming" && (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        className="text-red-600 disabled:opacity-50"
                        onClick={() => {
                          if (!confirm(t("erp.orders.confirmCancel"))) return;
                          patchOrder(o.id, { status: "cancelled" });
                        }}
                      >
                        {t("erp.orders.btnCancelBeforeShip")}
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

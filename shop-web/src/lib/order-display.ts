import { translate, type Locale } from "@/i18n/messages";
import type { Order } from "@/lib/types";

/** 쇼핑몰 내 주문 목록 */
export const SHOP_ORDER_PAGE_SIZE = 3;
/** ERP 주문 관리 */
export const ERP_ORDER_PAGE_SIZE = 5;

export type ErpOrderTab = "incoming" | "shipping" | "returns" | "closed";


export const TRACKING_CARRIERS = [
  "JNE",
  "J&T Express",
  "SiCepat",
  "Pos Indonesia",
  "AnterAja",
  "Ninja Xpress",
  "기타",
] as const;

export function orderStatusLabel(status: string, locale: Locale = "ko"): string {
  const keys: Record<string, string> = {
    pending: "erp.orders.statusPending",
    shipped: "erp.orders.statusShipped",
    completed: "erp.orders.statusCompleted",
    cancelled: "erp.orders.statusCancelled",
  };
  const key = keys[status];
  return key ? translate(locale, key) : status;
}

export function paymentStatusLabel(status?: string, locale: Locale = "ko"): string {
  const keys: Record<string, string> = {
    paid: "erp.orders.paymentPaid",
    cancelled: "erp.orders.paymentCancelled",
    pending: "erp.orders.paymentPending",
  };
  const key = keys[status || "pending"] ?? "erp.orders.paymentPending";
  return translate(locale, key);
}

export function returnStatusLabel(status?: string | null, locale: Locale = "ko"): string {
  if (!status) return "";
  const keys: Record<string, string> = {
    requested: "erp.orders.returnRequested",
    approved: "erp.orders.returnApproved",
    completed: "erp.orders.returnCompleted",
    rejected: "erp.orders.returnRejected",
  };
  const key = keys[status];
  return key ? translate(locale, key) : status;
}

export function canCancelOrder(order: Order): boolean {
  return order.status === "pending";
}

/** 최신순 목록에서 No. (1 = 가장 오래된 주문) */
export function orderListNo(total: number, indexInNewestFirst: number): number {
  return total - indexInNewestFirst;
}

export function findOrderNav(
  orders: Order[],
  currentId: string,
): {
  index: number;
  no: number;
  total: number;
  prevId: string | null;
  nextId: string | null;
} | null {
  const total = orders.length;
  const index = orders.findIndex((o) => o.id === currentId);
  if (index < 0) return null;
  const no = orderListNo(total, index);
  return {
    index,
    no,
    total,
    prevId: no > 1 ? orders[index + 1]?.id ?? null : null,
    nextId: no < total ? orders[index - 1]?.id ?? null : null,
  };
}

export function isActiveReturn(order: Order): boolean {
  return order.returnStatus === "requested" || order.returnStatus === "approved";
}

export function erpOrderTabDescription(tab: ErpOrderTab, locale: Locale = "ko"): string {
  const keys: Record<ErpOrderTab, string> = {
    incoming: "erp.orders.tabDesc.incoming",
    shipping: "erp.orders.tabDesc.shipping",
    returns: "erp.orders.tabDesc.returns",
    closed: "erp.orders.tabDesc.closed",
  };
  return translate(locale, keys[tab]);
}

export function trackingCarrierLabel(carrier: string, locale: Locale = "ko"): string {
  if (carrier === "기타") return translate(locale, "erp.orders.carrierOther");
  return carrier;
}

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

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "결제·발송 대기";
    case "shipped":
      return "배송 중";
    case "completed":
      return "배송 완료";
    case "cancelled":
      return "취소됨";
    default:
      return status;
  }
}

export function paymentStatusLabel(status?: string): string {
  switch (status) {
    case "paid":
      return "결제 완료";
    case "cancelled":
      return "결제 취소";
    case "pending":
    default:
      return "결제 대기";
  }
}

export function returnStatusLabel(status?: string | null): string {
  switch (status) {
    case "requested":
      return "반품 접수";
    case "approved":
      return "반품 승인";
    case "completed":
      return "반품 완료";
    case "rejected":
      return "반품 거절";
    default:
      return "";
  }
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

export function erpOrderTabDescription(tab: ErpOrderTab): string {
  switch (tab) {
    case "incoming":
      return "신규 접수 주문만 표시됩니다. 발송 처리 시 주문배송 탭으로 이동합니다.";
    case "shipping":
      return "발송 처리된 주문의 배송 추적·배송 완료를 관리합니다.";
    case "returns":
      return "반품 접수·승인·완료 처리 중인 주문입니다.";
    case "closed":
      return "반품 없이 마무리된 배송 완료 주문입니다.";
  }
}

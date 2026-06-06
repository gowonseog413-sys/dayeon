const ACTIVE_RETURN_STATUSES = new Set(["requested", "approved"]);

export function isActiveReturn(order) {
  return ACTIVE_RETURN_STATUSES.has(order?.returnStatus);
}

export function filterOrdersByTab(orders, tab) {
  switch (tab) {
    case "incoming":
      return orders.filter((o) => o.status === "pending");
    case "shipping":
      return orders.filter((o) => o.status === "shipped" && !isActiveReturn(o));
    case "returns":
      return orders.filter((o) => isActiveReturn(o));
    case "closed":
      return orders.filter(
        (o) =>
          o.status === "completed" &&
          !isActiveReturn(o) &&
          o.returnStatus !== "completed",
      );
    default:
      return orders;
  }
}

export function normalizeOrderTab(raw) {
  const tab = String(raw || "").toLowerCase();
  if (["incoming", "shipping", "returns", "closed"].includes(tab)) return tab;
  return null;
}

export function applyReturnStatus(order, next, { reason } = {}) {
  if (next === "requested") {
    if (!["completed", "shipped"].includes(order.status)) {
      return "배송 중 또는 배송 완료 주문만 반품 접수할 수 있습니다.";
    }
    if (isActiveReturn(order)) {
      return "이미 반품 처리 중인 주문입니다.";
    }
    order.returnStatus = "requested";
    order.returnReason =
      typeof reason === "string" && reason.trim()
        ? reason.trim().slice(0, 500)
        : order.returnReason || "";
    order.returnRequestedAt = new Date().toISOString();
    return null;
  }
  if (next === "approved") {
    if (order.returnStatus !== "requested") {
      return "반품 접수 상태의 주문만 승인할 수 있습니다.";
    }
    order.returnStatus = "approved";
    order.returnApprovedAt = new Date().toISOString();
    return null;
  }
  if (next === "completed") {
    if (!["requested", "approved"].includes(order.returnStatus)) {
      return "반품 승인·접수 상태의 주문만 반품 완료할 수 있습니다.";
    }
    order.returnStatus = "completed";
    order.returnCompletedAt = new Date().toISOString();
    if (order.status === "shipped") {
      order.status = "cancelled";
      order.paymentStatus = "cancelled";
      order.cancelledAt = new Date().toISOString();
      order.cancelledBy = "admin";
    }
    return null;
  }
  if (next === "rejected") {
    if (!order.returnStatus || order.returnStatus === "completed") {
      return "반품 거절할 수 없는 상태입니다.";
    }
    order.returnStatus = "rejected";
    order.returnRejectedAt = new Date().toISOString();
    return null;
  }
  return "알 수 없는 반품 상태입니다.";
}

export function buildOrderTabStats(orders) {
  const all = orders || [];
  return {
    incoming: filterOrdersByTab(all, "incoming").length,
    shipping: filterOrdersByTab(all, "shipping").length,
    returns: filterOrdersByTab(all, "returns").length,
    closed: filterOrdersByTab(all, "closed").length,
    cancelled: all.filter((o) => o.status === "cancelled").length,
    total: all.length,
  };
}

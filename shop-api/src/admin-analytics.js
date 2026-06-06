function dateKey(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

function isValidDateKey(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function parseOrderDate(order) {
  return dateKey(order.createdAt);
}

function isCountableOrder(order) {
  return order.status !== "cancelled";
}

function orderRevenue(order) {
  return isCountableOrder(order) ? Number(order.total) || 0 : 0;
}

function orderItemQty(order) {
  if (!isCountableOrder(order)) return 0;
  return (order.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function enumerateDateKeys(start, end) {
  const keys = [];
  const cur = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  while (cur <= endDate) {
    keys.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
    if (keys.length > 90) break;
  }
  return keys;
}

function resolveAnalyticsRange({ days = 14, from, to } = {}) {
  if (isValidDateKey(from) && isValidDateKey(to)) {
    let start = from;
    let end = to;
    if (start > end) [start, end] = [end, start];
    const keys = enumerateDateKeys(start, end);
    if (keys.length > 90) {
      start = keys[keys.length - 90];
    }
    const finalKeys = enumerateDateKeys(start, end);
    return {
      start: finalKeys[0],
      end: finalKeys[finalKeys.length - 1],
      periodDays: finalKeys.length,
    };
  }

  const span = Math.min(90, Math.max(7, Number(days) || 14));
  return {
    start: daysAgo(span - 1),
    end: todayKey(),
    periodDays: span,
  };
}

function filterOrdersByRange(orders, start, end) {
  return orders.filter((o) => {
    const k = parseOrderDate(o);
    return k >= start && k <= end;
  });
}

function buildDailySeriesRange(orders, start, end) {
  const keys = enumerateDateKeys(start, end);
  const map = Object.fromEntries(keys.map((k) => [k, { date: k, orders: 0, revenue: 0 }]));
  for (const o of orders) {
    const k = parseOrderDate(o);
    if (!map[k] || !isCountableOrder(o)) continue;
    map[k].orders += 1;
    map[k].revenue += orderRevenue(o);
  }
  return keys.map((k) => map[k]);
}

export function buildAnalyticsBoard(db, { days = 14, from, to } = {}) {
  const { start, end, periodDays } = resolveAnalyticsRange({ days, from, to });
  const allOrders = db.orders || [];
  const users = db.users || [];
  const products = db.products || [];
  const periodOrders = filterOrdersByRange(allOrders, start, end);
  const countable = periodOrders.filter(isCountableOrder);
  const revenue = countable.reduce((s, o) => s + orderRevenue(o), 0);
  const today = todayKey();
  const monthStart = monthStartKey();

  const ordersByStatus = {
    pending: periodOrders.filter((o) => o.status === "pending").length,
    shipped: periodOrders.filter((o) => o.status === "shipped").length,
    completed: periodOrders.filter((o) => o.status === "completed").length,
    cancelled: periodOrders.filter((o) => o.status === "cancelled").length,
  };

  const productQty = new Map();
  for (const o of countable) {
    for (const item of o.items || []) {
      const key = item.productId || item.name;
      const prev = productQty.get(key) || {
        productId: item.productId,
        name: item.name,
        brand: item.brand || "",
        quantity: 0,
        revenue: 0,
      };
      const qty = Number(item.quantity) || 0;
      prev.quantity += qty;
      prev.revenue += Number(item.lineTotal) || Number(item.priceSale) * qty || 0;
      productQty.set(key, prev);
    }
  }

  const topProducts = [...productQty.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  const categorySales = new Map();
  for (const o of countable) {
    for (const item of o.items || []) {
      const product = products.find((p) => p.id === item.productId);
      const cat = product?.category || "기타";
      const line = Number(item.lineTotal) || Number(item.priceSale) * (Number(item.quantity) || 0) || 0;
      categorySales.set(cat, (categorySales.get(cat) || 0) + line);
    }
  }

  const newMembers = users.filter((u) => {
    const created = dateKey(u.createdAt);
    return created >= start && created <= end;
  }).length;

  const allCountable = allOrders.filter(isCountableOrder);
  const todayOrders = allCountable.filter((o) => parseOrderDate(o) === today);
  const monthOrders = allCountable.filter((o) => parseOrderDate(o) >= monthStart);

  return {
    periodDays,
    range: { from: start, to: end },
    overview: {
      revenue,
      orders: countable.length,
      avgOrderValue: countable.length ? Math.round(revenue / countable.length) : 0,
      products: products.length,
      members: users.filter((u) => u.role !== "admin").length,
      newMembers,
      todayRevenue: todayOrders.reduce((s, o) => s + orderRevenue(o), 0),
      todayOrders: todayOrders.length,
      monthRevenue: monthOrders.reduce((s, o) => s + orderRevenue(o), 0),
      monthOrders: monthOrders.length,
    },
    dailySales: buildDailySeriesRange(periodOrders, start, end),
    ordersByStatus,
    topProducts,
    categorySales: [...categorySales.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    recentOrders: [...periodOrders]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 6)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
  };
}

export function buildCounterReport(db, { date, from, to } = {}) {
  const today = todayKey();
  let start = isValidDateKey(from) ? from : isValidDateKey(date) ? date : today;
  let end = isValidDateKey(to) ? to : isValidDateKey(date) ? date : start;
  if (start > end) [start, end] = [end, start];

  const orders = (db.orders || []).filter((o) => {
    const k = parseOrderDate(o);
    return k >= start && k <= end;
  });

  const countable = orders.filter(isCountableOrder);
  const revenue = countable.reduce((s, o) => s + orderRevenue(o), 0);
  const itemQty = countable.reduce((s, o) => s + orderItemQty(o), 0);

  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, "0")}:00`,
    orders: 0,
    revenue: 0,
  }));

  for (const o of countable) {
    const h = new Date(o.createdAt).getHours();
    if (h >= 0 && h < 24) {
      hourly[h].orders += 1;
      hourly[h].revenue += orderRevenue(o);
    }
  }

  const dailyBreakdown = new Map();
  for (const o of orders) {
    const k = parseOrderDate(o);
    const row = dailyBreakdown.get(k) || {
      date: k,
      orders: 0,
      revenue: 0,
      cancelled: 0,
      itemQty: 0,
    };
    if (isCountableOrder(o)) {
      row.orders += 1;
      row.revenue += orderRevenue(o);
      row.itemQty += orderItemQty(o);
    } else {
      row.cancelled += 1;
    }
    dailyBreakdown.set(k, row);
  }

  const monthStart = start.slice(0, 8) + "01";
  const monthOrders = (db.orders || []).filter((o) => {
    const k = parseOrderDate(o);
    return k >= monthStart && k <= end && isCountableOrder(o);
  });
  const monthRevenue = monthOrders.reduce((s, o) => s + orderRevenue(o), 0);

  return {
    range: { from: start, to: end },
    summary: {
      orders: countable.length,
      cancelled: orders.length - countable.length,
      revenue,
      itemQty,
      avgOrderValue: countable.length ? Math.round(revenue / countable.length) : 0,
      monthRevenue,
      monthOrders: monthOrders.length,
    },
    hourly,
    dailyBreakdown: [...dailyBreakdown.values()].sort((a, b) => a.date.localeCompare(b.date)),
    orders: [...orders]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        itemQty: orderItemQty(o),
        createdAt: o.createdAt,
        customerName: o.shipping?.name || o.user?.firstName || "-",
      })),
  };
}

import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { ensurePaymentChannels, listEnabledChannels } from "../payment-methods.js";
import { consolidateOrderItems, enrichOrder } from "../order-enrich.js";
import { calcOrderShippingFee } from "../shipping-fee.js";
import { syncOrderDeliveryStatus } from "../order-delivery.js";
import { deductUserPoints, refundOrderPoints } from "../points-rewards.js";

const router = Router();

const CANCELLABLE_STATUSES = new Set(["pending"]);

function nextOrderNumber(db) {
  const n = db.orders.length + 1;
  return `ES-${String(n).padStart(5, "0")}`;
}

router.post("/", authRequired, (req, res) => {
  const { items, shipping, paymentMethod, paymentProfileId } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "주문 항목이 없습니다." });
  }
  if (!shipping?.name || !shipping?.phone || !shipping?.address) {
    return res.status(400).json({ error: "배송 정보를 입력해 주세요." });
  }

  const db = readDb();
  let orderItems;
  try {
    orderItems = items.map((item) => {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`상품 없음: ${item.productId}`);
      const qty = Math.max(1, Number(item.quantity) || 1);
      return {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image || null,
        priceSale: product.priceSale,
        quantity: qty,
        lineTotal: product.priceSale * qty,
      };
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  orderItems = consolidateOrderItems(orderItems);

  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const shippingFee = calcOrderShippingFee(db, orderItems);
  const total = subtotal + shippingFee;

  ensurePaymentChannels(db);
  const enabledChannels = listEnabledChannels(db);
  let resolvedMethod = String(paymentMethod || "credit_card").trim();
  let jubelioCode = "";
  let paymentLabel = "";
  let profileId = "";

  if (paymentProfileId) {
    const profile = db.paymentProfiles.find(
      (p) => p.id === paymentProfileId && p.userId === req.user.sub,
    );
    if (profile) {
      profileId = profile.id;
      paymentLabel = profile.label;
      resolvedMethod = profile.channelType;
    }
  }

  const channel = enabledChannels.find((c) => c.type === resolvedMethod);
  if (!channel) {
    return res.status(400).json({ error: "사용할 수 없는 결제 방법입니다." });
  }
  jubelioCode = channel.jubelioCode;

  const pointsToUse = Math.max(0, Math.floor(Number(req.body.pointsToUse) || 0));

  const order = {
    id: uuid(),
    orderNumber: nextOrderNumber(db),
    userId: req.user.sub,
    items: orderItems,
    subtotal,
    shippingFee,
    total,
    pointsUsed: 0,
    shipping: {
      name: shipping.name,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city || "",
      postalCode: shipping.postalCode || "",
    },
    paymentMethod: resolvedMethod,
    paymentProfileId: profileId || undefined,
    paymentLabel: paymentLabel || undefined,
    jubelioCode,
    paymentStatus: "pending",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  updateDb((d) => {
    const user = d.users.find((u) => u.id === req.user.sub);
    if (pointsToUse > 0 && user) {
      const { used } = deductUserPoints(d, user, pointsToUse, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
      });
      order.pointsUsed = used;
      order.total = Math.max(0, total - used);
    }
    d.orders.push(order);
  });

  res.status(201).json({ order: enrichOrder(readDb(), order) });
});

router.get("/mine", authRequired, (req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();
  const orders = fresh.orders
    .filter((o) => o.userId === req.user.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => enrichOrder(db, o));
  res.json({ orders });
});

router.patch("/:id/cancel", authRequired, (req, res) => {
  const db = readDb();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  if (order.userId !== req.user.sub) {
    return res.status(403).json({ error: "권한이 없습니다." });
  }
  if (!CANCELLABLE_STATUSES.has(order.status)) {
    return res.status(400).json({ error: "발송 전 주문만 취소할 수 있습니다." });
  }

  order.status = "cancelled";
  order.paymentStatus = "cancelled";
  order.cancelledAt = new Date().toISOString();
  order.cancelledBy = "user";

  updateDb((d) => {
    const idx = d.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      refundOrderPoints(d, order);
      d.orders[idx] = order;
    }
  });

  res.json({ order: enrichOrder(readDb(), order) });
});

router.get("/:id", authRequired, (req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();
  const order = fresh.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  if (order.userId !== req.user.sub && req.user.role !== "admin") {
    return res.status(403).json({ error: "권한이 없습니다." });
  }
  res.json({ order: enrichOrder(fresh, order) });
});

export default router;

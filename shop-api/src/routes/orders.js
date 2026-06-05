import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { ensurePaymentChannels, listEnabledChannels } from "../payment-methods.js";

const router = Router();

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
        priceSale: product.priceSale,
        quantity: qty,
        lineTotal: product.priceSale * qty,
      };
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 10000;
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

  const order = {
    id: uuid(),
    orderNumber: nextOrderNumber(db),
    userId: req.user.sub,
    items: orderItems,
    subtotal,
    shippingFee,
    total,
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
    d.orders.push(order);
  });

  res.status(201).json({ order });
});

router.get("/mine", authRequired, (req, res) => {
  const orders = readDb()
    .orders.filter((o) => o.userId === req.user.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ orders });
});

router.get("/:id", authRequired, (req, res) => {
  const order = readDb().orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  if (order.userId !== req.user.sub && req.user.role !== "admin") {
    return res.status(403).json({ error: "권한이 없습니다." });
  }
  res.json({ order });
});

export default router;

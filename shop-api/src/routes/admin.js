import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
  buildAdminMemberRows,
  deleteMembersByIds,
  paginateMembers,
} from "../admin-users.js";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";
import { ensurePaymentChannels, maskProfile } from "../payment-methods.js";
import {
  buildPointsMemberRows,
  buildReferralRows,
  ensureMemberSettings,
  ensureUserReferralCodes,
  normalizePointsSettings,
  normalizeReferralSettings,
  referralCodeForUser,
} from "../member-settings.js";
import { computeUserTier } from "../user-tier.js";
import { normalizeSiteTheme } from "../site-theme.js";

const router = Router();
router.use(adminRequired);

router.get("/stats", (_req, res) => {
  const db = readDb();
  const revenue = db.orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  res.json({
    products: db.products.length,
    orders: db.orders.length,
    users: db.users.length,
    revenue,
    pendingOrders: db.orders.filter((o) => o.status === "pending").length,
  });
});

router.get("/products", (_req, res) => {
  res.json({ products: readDb().products });
});

function normalizeGalleryImages(raw, prev = []) {
  if (raw === undefined) return prev;
  if (!Array.isArray(raw)) return prev;
  return raw
    .map((item, i) => {
      const url = typeof item === "string" ? item.trim() : String(item?.url || "").trim();
      if (!url) return null;
      return {
        url,
        alt: (typeof item === "object" && item?.alt) || `썸네일 ${i + 2}`,
      };
    })
    .filter(Boolean)
    .slice(0, 6);
}

function buildProduct(body, id, prev = {}) {
  const badgeRaw = body.badge !== undefined ? body.badge : prev.badge;
  const badge = badgeRaw === "" || badgeRaw === null ? null : badgeRaw || null;
  const images = normalizeGalleryImages(body.images, prev.images);
  return {
    ...prev,
    id,
    brand: body.brand ?? prev.brand ?? "Brand",
    name: body.name ?? prev.name ?? "New Product",
    category: body.category ?? prev.category ?? "contact-lenses",
    section: body.section ?? prev.section ?? "bloominc",
    priceOriginal: Number(body.priceOriginal ?? prev.priceOriginal) || 0,
    priceSale: Number(body.priceSale ?? prev.priceSale) || 0,
    stock: Math.max(0, Math.floor(Number(body.stock ?? prev.stock ?? 0) || 0)),
    categoryMid: body.categoryMid !== undefined ? String(body.categoryMid || "").trim() || undefined : prev.categoryMid,
    categorySub: body.categorySub !== undefined ? String(body.categorySub || "").trim() || undefined : prev.categorySub,
    badge,
    image: body.image ?? prev.image ?? "/placeholders/lens-gray.svg",
    images,
    colorSwatch: body.colorSwatch ?? prev.colorSwatch ?? "#ec4899",
    description: body.description ?? prev.description ?? "",
    detailDescription: body.detailDescription ?? prev.detailDescription ?? "",
    additionalInfo: body.additionalInfo ?? prev.additionalInfo ?? "",
    shippingInfo: body.shippingInfo ?? prev.shippingInfo ?? "",
    createdAt: prev.createdAt,
  };
}

router.post("/products", (req, res) => {
  const product = {
    ...buildProduct(req.body, uuid()),
    createdAt: new Date().toISOString(),
  };

  updateDb((d) => {
    d.products.push(product);
  });
  res.status(201).json({ product });
});

router.put("/products/:id", (req, res) => {
  let updated = null;
  updateDb((d) => {
    const idx = d.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return;
    const prev = d.products[idx];
    d.products[idx] = buildProduct(req.body, req.params.id, prev);
    updated = d.products[idx];
  });
  if (!updated) return res.status(404).json({ error: "상품 없음" });
  res.json({ product: updated });
});

router.patch("/products/:id/stock", (req, res) => {
  const stock = Math.max(0, Math.floor(Number(req.body?.stock) || 0));
  let updated = null;
  updateDb((d) => {
    const idx = d.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return;
    d.products[idx] = { ...d.products[idx], stock };
    updated = d.products[idx];
  });
  if (!updated) return res.status(404).json({ error: "상품 없음" });
  res.json({ product: updated });
});

router.delete("/products/:id", (req, res) => {
  let found = false;
  updateDb((d) => {
    const before = d.products.length;
    d.products = d.products.filter((p) => p.id !== req.params.id);
    found = d.products.length < before;
  });
  if (!found) return res.status(404).json({ error: "상품 없음" });
  res.json({ ok: true });
});

router.get("/orders", (_req, res) => {
  const db = readDb();
  const orders = db.orders
    .map((o) => ({
      ...o,
      user: db.users.find((u) => u.id === o.userId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ orders });
});

router.patch("/orders/:id", (req, res) => {
  let updated = null;
  updateDb((d) => {
    const order = d.orders.find((o) => o.id === req.params.id);
    if (!order) return;
    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    updated = order;
  });
  if (!updated) return res.status(404).json({ error: "주문 없음" });
  res.json({ order: updated });
});

router.get("/users", (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.pageSize || "10"), 10) || 10),
  );
  const rows = buildAdminMemberRows(readDb());
  res.json(paginateMembers(rows, page, pageSize));
});

router.get("/users/export", (_req, res) => {
  const users = buildAdminMemberRows(readDb());
  res.json({ users });
});

router.get("/users/:id/cart", (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "회원 없음" });

  const cart = (db.carts || []).find((c) => c.userId === req.params.id);
  const items = (cart?.items || []).map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      savedAt: item.savedAt || null,
      product: product
        ? {
            id: product.id,
            brand: product.brand,
            name: product.name,
            image: product.image,
            priceSale: product.priceSale,
          }
        : null,
    };
  });
  const total = items.reduce(
    (sum, line) => sum + (line.product?.priceSale || 0) * line.quantity,
    0,
  );
  res.json({ items, total, updatedAt: cart?.updatedAt || null });
});

router.get("/users/:id/payment-profiles", (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "회원 없음" });

  ensurePaymentChannels(db);
  const profiles = (db.paymentProfiles || [])
    .filter((p) => p.userId === req.params.id)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .map(maskProfile);

  res.json({ profiles });
});

router.post("/users/bulk-delete", (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (ids.length === 0) {
    return res.status(400).json({ error: "삭제할 회원을 선택해 주세요." });
  }
  let result = { deleted: 0, skippedAdmin: 0 };
  updateDb((d) => {
    result = deleteMembersByIds(d, ids);
  });
  if (result.deleted === 0 && result.skippedAdmin > 0) {
    return res.status(400).json({
      error: "관리자 계정은 삭제할 수 없습니다.",
      ...result,
    });
  }
  res.json({ ok: true, ...result });
});

router.get("/settings/points", (_req, res) => {
  const db = readDb();
  ensureMemberSettings(db);
  res.json({ settings: db.settings.points, members: buildPointsMemberRows(db) });
});

router.patch("/settings/points", (req, res) => {
  const settings = normalizePointsSettings(req.body);
  updateDb((d) => {
    ensureMemberSettings(d);
    d.settings.points = settings;
    for (const u of d.users) {
      if (!u.tier) u.tier = computeUserTier(u.points, settings);
    }
  });
  const db = readDb();
  res.json({ settings: db.settings.points, members: buildPointsMemberRows(db) });
});

router.patch("/users/:id/points", (req, res) => {
  const points = Math.max(0, Math.floor(Number(req.body?.points) || 0));
  let updated = null;
  updateDb((d) => {
    ensureMemberSettings(d);
    const user = d.users.find((u) => u.id === req.params.id);
    if (!user) return;
    user.points = points;
    user.tier = computeUserTier(points, d.settings.points);
    updated = {
      id: user.id,
      name: `${user.firstName || ""}${user.lastName ? ` ${user.lastName}` : ""}`.trim(),
      email: user.email,
      points: user.points,
      tier: user.tier,
    };
  });
  if (!updated) return res.status(404).json({ error: "회원 없음" });
  res.json({ user: updated });
});

router.get("/settings/referral", (_req, res) => {
  const db = readDb();
  ensureMemberSettings(db);
  ensureUserReferralCodes(db);
  res.json({
    settings: db.settings.referral,
    referrals: buildReferralRows(db),
    codes: db.users
      .filter((u) => u.role !== "admin")
      .map((u) => ({
        userId: u.id,
        name: `${u.firstName || ""}${u.lastName ? ` ${u.lastName}` : ""}`.trim(),
        email: u.email,
        code: referralCodeForUser(u),
        referralCount: db.users.filter((x) => x.referredBy === u.id).length,
      }))
      .sort((a, b) => b.referralCount - a.referralCount),
  });
});

router.patch("/settings/referral", (req, res) => {
  const settings = normalizeReferralSettings(req.body);
  updateDb((d) => {
    ensureMemberSettings(d);
    d.settings.referral = settings;
  });
  const db = readDb();
  ensureUserReferralCodes(db);
  res.json({
    settings: db.settings.referral,
    referrals: buildReferralRows(db),
  });
});

router.get("/settings/theme", (_req, res) => {
  const db = readDb();
  res.json({ theme: normalizeSiteTheme(db.settings?.theme) });
});

router.patch("/settings/theme", (req, res) => {
  const theme = normalizeSiteTheme(req.body?.theme);
  updateDb((d) => {
    if (!d.settings) d.settings = {};
    d.settings.theme = theme;
  });
  res.json({ theme });
});

export default router;

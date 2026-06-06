import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
  buildAdminMemberRows,
  deleteMembersByIds,
  normalizeMemberSort,
  paginateMembers,
  sortMembers,
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
  normalizeReviewReward,
  normalizeSignupBonus,
  referralCodeForUser,
  syncAllUserTiers,
} from "../member-settings.js";
import {
  createManagedReview,
  deleteReview,
  listAdminReviews,
  updateManagedReview,
} from "../review-admin.js";
import {
  ensurePointLedger,
  listAllPointTransactions,
  recordPointTransaction,
} from "../point-transactions.js";
import { applyOrderCompletionRewards, refundOrderPoints } from "../points-rewards.js";
import { syncUserTier } from "../user-tier.js";
import { enrichOrder } from "../order-enrich.js";
import {
  markOrderCompleted,
  markOrderShipped,
  syncOrderDeliveryStatus,
} from "../order-delivery.js";
import {
  applyReturnStatus,
  buildOrderTabStats,
  filterOrdersByTab,
  normalizeOrderTab,
} from "../order-admin.js";
import { getIndexBanner, normalizeIndexBanner } from "../index-banner.js";
import { getPartnerBanners, normalizePartnerBanners } from "../partner-banners.js";
import { getSocialChannels, normalizeSocialChannels } from "../social-channels.js";
import { getHeroBanners, normalizeHeroBanners } from "../hero-banners.js";
import { isMotionEnabled, normalizeThemeMotion } from "../site-theme-motion.js";
import { normalizeSiteTheme } from "../site-theme.js";
import { buildAnalyticsBoard, buildCounterReport } from "../admin-analytics.js";
import { ensureProductCreatedAt } from "../product-dates.js";
import { restoreStockForOrder } from "../inventory.js";

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

router.get("/analytics", (req, res) => {
  res.json(
    buildAnalyticsBoard(readDb(), {
      days: Number(req.query.days) || 14,
      from: req.query.from,
      to: req.query.to,
    }),
  );
});

router.get("/counter", (req, res) => {
  res.json(
    buildCounterReport(readDb(), {
      date: req.query.date,
      from: req.query.from,
      to: req.query.to,
    }),
  );
});

router.get("/products", (_req, res) => {
  updateDb((d) => {
    ensureProductCreatedAt(d);
  });
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
    discountPercent: Math.min(
      99,
      Math.max(0, Math.floor(Number(body.discountPercent ?? prev.discountPercent ?? 0) || 0)),
    ),
    stock: Math.max(0, Math.floor(Number(body.stock ?? prev.stock ?? 0) || 0)),
    pointsEnabled:
      body.pointsEnabled !== undefined
        ? Boolean(body.pointsEnabled)
        : prev.pointsEnabled !== false,
    shippingFeeCharged: Boolean(
      body.shippingFeeCharged !== undefined
        ? body.shippingFeeCharged
        : prev.shippingFeeCharged,
    ),
    shippingFeeAmount: body.shippingFeeCharged === false
      ? 0
      : Math.max(
          0,
          Math.floor(
            Number(
              body.shippingFeeAmount !== undefined
                ? body.shippingFeeAmount
                : prev.shippingFeeAmount ?? 0,
            ) || 0,
          ),
        ),
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

router.get("/orders/stats", (_req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();
  res.json({ tabCounts: buildOrderTabStats(fresh.orders) });
});

router.get("/orders", (req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();
  const tab = normalizeOrderTab(req.query.tab);
  let rows = fresh.orders;
  if (tab) rows = filterOrdersByTab(rows, tab);
  const orders = rows
    .map((o) => ({
      ...enrichOrder(fresh, o),
      user: fresh.users.find((u) => u.id === o.userId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ orders, tab, tabCounts: buildOrderTabStats(fresh.orders) });
});

router.patch("/orders/:id", (req, res) => {
  syncOrderDeliveryStatus(readDb());

  let updated = null;
  let error = null;
  updateDb((d) => {
    const order = d.orders.find((o) => o.id === req.params.id);
    if (!order) return;
    if (req.body.status) {
      const next = req.body.status;
      if (next === "cancelled" && order.status !== "pending") {
        error = "발송 전(pending) 주문만 취소할 수 있습니다.";
        return;
      }
      if (next === "shipped") {
        if (order.status !== "pending") {
          error = "결제·발송 대기 주문만 발송 처리할 수 있습니다.";
          return;
        }
        markOrderShipped(order);
        if (typeof req.body.trackingCarrier === "string") {
          order.trackingCarrier = req.body.trackingCarrier.trim().slice(0, 60);
        }
        if (typeof req.body.trackingNumber === "string") {
          order.trackingNumber = req.body.trackingNumber.trim().slice(0, 80);
        }
      } else if (next === "completed") {
        if (!["pending", "shipped"].includes(order.status)) {
          error = "배송 완료 처리할 수 없는 주문 상태입니다.";
          return;
        }
        markOrderCompleted(order);
        applyOrderCompletionRewards(d, order);
      } else if (next === "cancelled") {
        restoreStockForOrder(d, order.items);
        refundOrderPoints(d, order);
        order.status = "cancelled";
        order.paymentStatus = "cancelled";
        order.cancelledAt = new Date().toISOString();
        order.cancelledBy = "admin";
      } else {
        order.status = next;
      }
    }
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;

    if (
      typeof req.body.trackingCarrier === "string" &&
      ["pending", "shipped"].includes(order.status)
    ) {
      order.trackingCarrier = req.body.trackingCarrier.trim().slice(0, 60);
    }
    if (
      typeof req.body.trackingNumber === "string" &&
      ["pending", "shipped"].includes(order.status)
    ) {
      order.trackingNumber = req.body.trackingNumber.trim().slice(0, 80);
    }

    if (req.body.returnStatus) {
      const returnErr = applyReturnStatus(order, req.body.returnStatus, {
        reason: req.body.returnReason,
      });
      if (returnErr) {
        error = returnErr;
        return;
      }
    }

    updated = order;
  });
  if (error) return res.status(400).json({ error });
  if (!updated) return res.status(404).json({ error: "주문 없음" });
  res.json({ order: updated });
});

router.get("/users", (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.pageSize || "10"), 10) || 10),
  );
  const { sortBy, sortDir } = normalizeMemberSort(req.query.sortBy, req.query.sortDir);
  const rows = sortMembers(buildAdminMemberRows(readDb()), sortBy, sortDir);
  res.json({ ...paginateMembers(rows, page, pageSize), sortBy, sortDir });
});

router.get("/users/export", (req, res) => {
  const { sortBy, sortDir } = normalizeMemberSort(req.query.sortBy, req.query.sortDir);
  const users = sortMembers(buildAdminMemberRows(readDb()), sortBy, sortDir);
  res.json({ users, sortBy, sortDir });
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
  res.json({
    settings: db.settings.points,
    signupBonus: db.settings.signupBonus,
    members: buildPointsMemberRows(db),
  });
});

router.patch("/settings/points", (req, res) => {
  updateDb((d) => {
    ensureMemberSettings(d);
    const hasPointsFields = [
      "tierSilver",
      "tierGold",
      "tierDiamond",
      "tierVip",
      "earnRateBronze",
      "earnRateSilver",
      "earnRateGold",
      "earnRateDiamond",
    ].some((k) => req.body?.[k] !== undefined);
    if (hasPointsFields) {
      d.settings.points = normalizePointsSettings({
        ...d.settings.points,
        ...req.body,
      });
    }
    if (req.body?.signupBonus !== undefined) {
      d.settings.signupBonus = normalizeSignupBonus(req.body.signupBonus);
    }
    syncAllUserTiers(d);
  });
  const db = readDb();
  res.json({
    settings: db.settings.points,
    signupBonus: db.settings.signupBonus,
    members: buildPointsMemberRows(db),
  });
});

router.delete("/settings/signup-bonus", (_req, res) => {
  updateDb((d) => {
    ensureMemberSettings(d);
    d.settings.signupBonus = normalizeSignupBonus({
      enabled: false,
      points: 0,
      welcomeMessageEnabled: false,
    });
  });
  const db = readDb();
  res.json({ signupBonus: db.settings.signupBonus });
});

router.get("/reviews", (req, res) => {
  const db = readDb();
  const scope =
    req.query.scope === "managed" ? "managed" : req.query.scope === "member" ? "member" : "all";
  res.json({ reviews: listAdminReviews(db, { scope }) });
});

router.post("/reviews/managed", (req, res) => {
  let created = null;
  try {
    updateDb((d) => {
      created = createManagedReview(d, req.body || {});
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "리뷰 등록 실패" });
  }
  res.status(201).json({ review: created });
});

router.patch("/reviews/:id/managed", (req, res) => {
  let updated = null;
  try {
    updateDb((d) => {
      updated = updateManagedReview(d, req.params.id, req.body || {});
      if (!updated) return;
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "리뷰 수정 실패" });
  }
  if (!updated) return res.status(404).json({ error: "리뷰를 찾을 수 없습니다." });
  res.json({ review: updated });
});

router.delete("/reviews/:id", (req, res) => {
  let removed = false;
  updateDb((d) => {
    removed = deleteReview(d, req.params.id);
  });
  if (!removed) return res.status(404).json({ error: "리뷰를 찾을 수 없습니다." });
  res.json({ ok: true });
});

router.get("/settings/review-reward", (_req, res) => {
  const db = readDb();
  ensureMemberSettings(db);
  res.json({ reviewReward: db.settings.reviewReward });
});

router.patch("/settings/review-reward", (req, res) => {
  updateDb((d) => {
    ensureMemberSettings(d);
    d.settings.reviewReward = normalizeReviewReward({
      ...d.settings.reviewReward,
      ...req.body?.reviewReward,
      ...req.body,
    });
  });
  const db = readDb();
  res.json({ reviewReward: db.settings.reviewReward });
});

router.get("/point-transactions", (_req, res) => {
  const page = Math.max(1, parseInt(_req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(_req.query.pageSize, 10) || 20));
  updateDb((d) => ensurePointLedger(d));
  const db = readDb();
  res.json(listAllPointTransactions(db, { page, pageSize }));
});

router.patch("/users/:id/points", (req, res) => {
  const points = Math.max(0, Math.floor(Number(req.body?.points) || 0));
  let updated = null;
  updateDb((d) => {
    ensureMemberSettings(d);
    ensurePointLedger(d);
    const user = d.users.find((u) => u.id === req.params.id);
    if (!user) return;
    const prev = Math.max(0, Math.floor(Number(user.points) || 0));
    user.points = points;
    const delta = points - prev;
    if (delta !== 0) {
      recordPointTransaction(d, {
        userId: user.id,
        amount: delta,
        type: "admin",
        label: delta > 0 ? "관리자 포인트 지급" : "관리자 포인트 차감",
        refId: `admin-${user.id}-${uuid()}`,
      });
    }
    syncUserTier(d, user.id, d.settings.points);
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

function getThemeSettings(db) {
  const theme = normalizeSiteTheme(db.settings?.theme);
  const themeMotion = normalizeThemeMotion(db.settings?.themeMotion);
  return {
    theme,
    themeMotion,
    motionEnabled: isMotionEnabled(themeMotion, theme),
  };
}

router.get("/settings/theme", (_req, res) => {
  const db = readDb();
  res.json(getThemeSettings(db));
});

router.patch("/settings/theme", (req, res) => {
  updateDb((d) => {
    if (!d.settings) d.settings = {};
    if (req.body?.theme !== undefined) {
      d.settings.theme = normalizeSiteTheme(req.body.theme);
    }
    if (req.body?.themeMotion !== undefined && typeof req.body.themeMotion === "object") {
      const current = normalizeThemeMotion(d.settings.themeMotion);
      d.settings.themeMotion = normalizeThemeMotion({
        ...current,
        ...req.body.themeMotion,
      });
    }
  });
  const db = readDb();
  res.json(getThemeSettings(db));
});

router.get("/settings/index-banner", (_req, res) => {
  const db = readDb();
  res.json({ indexBanner: getIndexBanner(db) });
});

router.patch("/settings/index-banner", (req, res) => {
  updateDb((d) => {
    if (!d.settings) d.settings = {};
    const current = getIndexBanner(d);
    d.settings.indexBanner = normalizeIndexBanner({
      ...current,
      ...(req.body?.indexBanner && typeof req.body.indexBanner === "object"
        ? req.body.indexBanner
        : {}),
    });
  });
  const db = readDb();
  res.json({ indexBanner: getIndexBanner(db) });
});

router.get("/settings/partner-banners", (_req, res) => {
  const db = readDb();
  res.json({ partnerBanners: getPartnerBanners(db) });
});

router.patch("/settings/partner-banners", (req, res) => {
  updateDb((d) => {
    if (!d.settings) d.settings = {};
    d.settings.partnerBanners = normalizePartnerBanners(req.body?.partnerBanners);
  });
  const db = readDb();
  res.json({ partnerBanners: getPartnerBanners(db) });
});

router.get("/settings/social-channels", (_req, res) => {
  const db = readDb();
  res.json({ socialChannels: getSocialChannels(db) });
});

router.patch("/settings/social-channels", (req, res) => {
  updateDb((d) => {
    if (!d.settings) d.settings = {};
    d.settings.socialChannels = normalizeSocialChannels(req.body?.socialChannels);
  });
  const db = readDb();
  res.json({ socialChannels: getSocialChannels(db) });
});

router.get("/settings/hero-banners", (_req, res) => {
  const db = readDb();
  res.json({ heroBanners: getHeroBanners(db) });
});

router.patch("/settings/hero-banners", (req, res) => {
  updateDb((d) => {
    if (!d.settings) d.settings = {};
    d.settings.heroBanners = normalizeHeroBanners(req.body?.heroBanners);
  });
  const db = readDb();
  res.json({ heroBanners: getHeroBanners(db) });
});

export default router;

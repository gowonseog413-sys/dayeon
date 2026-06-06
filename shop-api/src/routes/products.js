import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { enrichLensProduct } from "../product-details.js";
import { syncOrderDeliveryStatus } from "../order-delivery.js";
import { applyReviewReward } from "../points-rewards.js";
import { userCanReviewProduct } from "../review-eligibility.js";

const router = Router();

function stripStock(product) {
  if (!product || typeof product !== "object") return product;
  const { stock: _s, ...rest } = product;
  return rest;
}

function reviewSummary(reviews) {
  if (!reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

router.get("/", (req, res) => {
  const { section, category, q } = req.query;
  let items = readDb().products.map((p) => enrichLensProduct(p));

  if (section) items = items.filter((p) => p.section === section);
  if (category) items = items.filter((p) => p.category === category);
  if (q) {
    const term = String(q).toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term),
    );
  }

  res.json({ products: items });
});

router.get("/:id/reviews", (req, res) => {
  const reviews = readDb()
    .reviews.filter((r) => r.productId === req.params.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ reviews, ...reviewSummary(reviews) });
});

router.get("/:id/reviews/eligibility", authRequired, (req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();
  const eligibility = userCanReviewProduct(fresh, req.user.sub, req.params.id);
  res.json(eligibility);
});

router.post("/:id/reviews", authRequired, (req, res) => {
  const db = readDb();
  syncOrderDeliveryStatus(db);
  const fresh = readDb();
  const product = fresh.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });

  const eligibility = userCanReviewProduct(fresh, req.user.sub, req.params.id);
  if (!eligibility.ok) {
    const msg =
      eligibility.reason === "already_reviewed"
        ? "이미 이 상품에 리뷰를 작성하셨습니다."
        : "배송 완료된 주문 상품만 리뷰를 작성할 수 있습니다.";
    return res.status(403).json({ error: msg, reason: eligibility.reason });
  }

  const rating = Number(req.body.rating);
  const content = String(req.body.content || "").trim();
  if (!content) return res.status(400).json({ error: "리뷰 내용을 입력해 주세요." });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "별점은 1~5 사이로 선택해 주세요." });
  }

  const user = fresh.users.find((u) => u.id === req.user.sub);
  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "회원";

  const review = {
    id: uuid(),
    productId: req.params.id,
    userId: req.user.sub,
    orderId: eligibility.orderId,
    userName,
    rating: Math.round(rating),
    content,
    createdAt: new Date().toISOString(),
  };

  let pointsAwarded = 0;
  updateDb((d) => {
    if (!d.reviews) d.reviews = [];
    d.reviews.push(review);
    const u = d.users.find((x) => x.id === req.user.sub);
    if (u) pointsAwarded = applyReviewReward(d, u, review);
  });

  res.status(201).json({ review, pointsAwarded });
});

router.get("/:id", (req, res) => {
  const raw = readDb().products.find((p) => p.id === req.params.id);
  if (!raw) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  const product = enrichLensProduct(raw);
  const reviews = readDb().reviews.filter((r) => r.productId === req.params.id);
  res.json({ product: stripStock(product), reviewSummary: reviewSummary(reviews) });
});

export default router;

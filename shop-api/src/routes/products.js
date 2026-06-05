import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { enrichLensProduct } from "../product-details.js";

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

router.post("/:id/reviews", authRequired, (req, res) => {
  const db = readDb();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });

  // TODO: 구매 이력 확인 — 해당 userId가 이 productId를 포함한 완료 주문이 있을 때만 허용

  const rating = Number(req.body.rating);
  const content = String(req.body.content || "").trim();
  if (!content) return res.status(400).json({ error: "리뷰 내용을 입력해 주세요." });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "별점은 1~5 사이로 선택해 주세요." });
  }

  const user = db.users.find((u) => u.id === req.user.sub);
  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "회원";

  const review = {
    id: uuid(),
    productId: req.params.id,
    userId: req.user.sub,
    userName,
    rating: Math.round(rating),
    content,
    createdAt: new Date().toISOString(),
  };

  updateDb((d) => {
    if (!d.reviews) d.reviews = [];
    d.reviews.push(review);
  });

  res.status(201).json({ review });
});

router.get("/:id", (req, res) => {
  const raw = readDb().products.find((p) => p.id === req.params.id);
  if (!raw) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  const product = enrichLensProduct(raw);
  const reviews = readDb().reviews.filter((r) => r.productId === req.params.id);
  res.json({ product: stripStock(product), reviewSummary: reviewSummary(reviews) });
});

export default router;

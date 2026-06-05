import { Router } from "express";
import { readDb } from "../db.js";

const router = Router();

const CATEGORIES = {
  "beauty-lifestyle": "뷰티 및 라이프스타일",
  community: "커뮤니티",
  reviews: "리뷰",
  tips: "팁과 요령",
};

router.get("/categories", (_req, res) => {
  res.json({ categories: CATEGORIES });
});

const PAGE_SIZE = 6;

function mapArticle(a) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    categoryLabel: CATEGORIES[a.category] || a.category,
    image: a.image,
    createdAt: a.createdAt,
  };
}

router.get("/", (req, res) => {
  const { category, page: pageQ, limit: limitQ } = req.query;
  let items = readDb()
    .articles.filter((a) => a.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (category && category !== "all") {
    items = items.filter((a) => a.category === category);
  }

  const limit = Math.min(24, Math.max(1, Number(limitQ) || PAGE_SIZE));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(totalPages, Math.max(1, Number(pageQ) || 1));
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);

  res.json({
    articles: slice.map(mapArticle),
    pagination: { page, limit, total, totalPages },
  });
});

router.get("/:slug", (req, res) => {
  const article = readDb().articles.find(
    (a) => a.slug === req.params.slug && a.published,
  );
  if (!article) return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
  res.json({
    article: {
      ...article,
      categoryLabel: CATEGORIES[article.category] || article.category,
    },
  });
});

export default router;

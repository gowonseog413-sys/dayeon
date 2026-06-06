import { Router } from "express";
import {
  articleCategoryMap,
  ensureArticleCategories,
  listArticleCategories,
} from "../article-categories.js";
import { readDb, updateDb } from "../db.js";

const router = Router();

const PAGE_SIZE = 6;

function mapArticle(db, a) {
  const categories = articleCategoryMap(db);
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    categoryLabel: categories[a.category] || a.category,
    image: a.image,
    createdAt: a.createdAt,
  };
}

router.get("/categories", (_req, res) => {
  updateDb((d) => ensureArticleCategories(d));
  res.json({ categories: listArticleCategories(readDb()) });
});

router.get("/", (req, res) => {
  const db = readDb();
  const { category, page: pageQ, limit: limitQ } = req.query;
  let items = db.articles
    .filter((a) => a.published)
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
    articles: slice.map((a) => mapArticle(db, a)),
    pagination: { page, limit, total, totalPages },
  });
});

router.get("/:slug", (req, res) => {
  const db = readDb();
  const article = db.articles.find((a) => a.slug === req.params.slug && a.published);
  if (!article) return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
  res.json({
    article: {
      ...article,
      categoryLabel: articleCategoryMap(db)[article.category] || article.category,
    },
  });
});

export default router;

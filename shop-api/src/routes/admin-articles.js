import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
  countArticlesInCategory,
  createArticleCategory,
  deleteArticleCategory,
  ensureArticleCategories,
  listArticleCategories,
  updateArticleCategory,
} from "../article-categories.js";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";

const router = Router();
router.use(adminRequired);

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-가-힣]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || uuid().slice(0, 8)
  );
}

router.get("/categories", (_req, res) => {
  updateDb((d) => ensureArticleCategories(d));
  const db = readDb();
  const categories = listArticleCategories(db).map((c) => ({
    ...c,
    articleCount: countArticlesInCategory(db, c.id),
  }));
  res.json({ categories });
});

router.post("/categories", (req, res) => {
  let created = null;
  try {
    updateDb((d) => {
      created = createArticleCategory(d, req.body || {});
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "카테고리 등록 실패" });
  }
  res.status(201).json({ category: created });
});

router.put("/categories/:id", (req, res) => {
  let updated = null;
  try {
    updateDb((d) => {
      updated = updateArticleCategory(d, req.params.id, req.body || {});
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || "카테고리 수정 실패" });
  }
  if (!updated) return res.status(404).json({ error: "카테고리를 찾을 수 없습니다." });
  res.json({ category: updated });
});

router.delete("/categories/:id", (req, res) => {
  let removed = false;
  try {
    updateDb((d) => {
      removed = deleteArticleCategory(d, req.params.id, {
        reassignTo: req.query.reassignTo,
      });
    });
  } catch (err) {
    if (err.code === "IN_USE") {
      return res.status(409).json({
        error: "IN_USE",
        count: err.count,
        message: err.message,
      });
    }
    return res.status(400).json({ error: err.message || "카테고리 삭제 실패" });
  }
  if (!removed) return res.status(404).json({ error: "카테고리를 찾을 수 없습니다." });
  res.json({ ok: true });
});

router.get("/", (_req, res) => {
  const db = readDb();
  ensureArticleCategories(db);
  const articles = db.articles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ articles });
});

router.post("/", (req, res) => {
  const { title, excerpt, content, category, image, published } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: "제목을 입력해 주세요." });
  }

  const db = readDb();
  let slug = slugify(title);
  if (db.articles.some((a) => a.slug === slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const article = {
    id: uuid(),
    slug,
    title: title.trim(),
    excerpt: (excerpt || "").trim(),
    content: (content || "").trim(),
    category: category || "beauty-lifestyle",
    image: image || "/articles/placeholder.svg",
    published: Boolean(published),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateDb((d) => {
    ensureArticleCategories(d);
    const defaultCategory = listArticleCategories(d)[0]?.id || "beauty-lifestyle";
    article.category = category || defaultCategory;
    d.articles.push(article);
  });

  res.status(201).json({ article });
});

router.put("/:id", (req, res) => {
  let updated = null;
  updateDb((d) => {
    const idx = d.articles.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return;
    const prev = d.articles[idx];
    d.articles[idx] = {
      ...prev,
      title: req.body.title?.trim() ?? prev.title,
      excerpt: req.body.excerpt?.trim() ?? prev.excerpt,
      content: req.body.content?.trim() ?? prev.content,
      category: req.body.category ?? prev.category,
      image: req.body.image ?? prev.image,
      published:
        req.body.published !== undefined ? Boolean(req.body.published) : prev.published,
      updatedAt: new Date().toISOString(),
    };
    updated = d.articles[idx];
  });
  if (!updated) return res.status(404).json({ error: "게시물 없음" });
  res.json({ article: updated });
});

router.delete("/:id", (req, res) => {
  let found = false;
  updateDb((d) => {
    const before = d.articles.length;
    d.articles = d.articles.filter((a) => a.id !== req.params.id);
    found = d.articles.length < before;
  });
  if (!found) return res.status(404).json({ error: "게시물 없음" });
  res.json({ ok: true });
});

export default router;

import { Router } from "express";
import { v4 as uuid } from "uuid";
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

router.get("/", (_req, res) => {
  const articles = readDb()
    .articles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

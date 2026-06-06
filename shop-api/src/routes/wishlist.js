import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function ensureWishlists(db) {
  if (!Array.isArray(db.wishlists)) db.wishlists = [];
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of items) {
    const productId = String(raw?.productId || "").trim();
    if (!productId || seen.has(productId)) continue;
    seen.add(productId);
    let id = String(raw?.id || "").trim();
    if (!id) id = `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    result.push({
      id,
      productId,
      savedAt: raw?.savedAt || new Date().toISOString(),
    });
  }
  return result.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
}

function findUserWishlist(db, userId) {
  ensureWishlists(db);
  return db.wishlists.find((w) => w.userId === userId);
}

router.get("/", authRequired, (req, res) => {
  const db = readDb();
  const entry = findUserWishlist(db, req.user.sub);
  res.json({ items: entry?.items || [] });
});

router.put("/", authRequired, (req, res) => {
  const items = sanitizeItems(req.body?.items);
  const now = new Date().toISOString();

  updateDb((db) => {
    ensureWishlists(db);
    const idx = db.wishlists.findIndex((w) => w.userId === req.user.sub);
    const entry = { userId: req.user.sub, items, updatedAt: now };
    if (idx >= 0) db.wishlists[idx] = entry;
    else db.wishlists.push(entry);
  });

  res.json({ items });
});

router.post("/", authRequired, (req, res) => {
  const productId = String(req.body?.productId || "").trim();
  if (!productId) return res.status(400).json({ error: "상품 ID가 필요합니다." });

  const db = readDb();
  if (!db.products.find((p) => p.id === productId)) {
    return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  }

  let items = [];
  updateDb((d) => {
    ensureWishlists(d);
    const idx = d.wishlists.findIndex((w) => w.userId === req.user.sub);
    const current = idx >= 0 ? d.wishlists[idx].items : [];
    const exists = current.some((i) => i.productId === productId);
    items = exists
      ? current.filter((i) => i.productId !== productId)
      : sanitizeItems([
          {
            id: `w-${Date.now()}`,
            productId,
            savedAt: new Date().toISOString(),
          },
          ...current,
        ]);
    const entry = {
      userId: req.user.sub,
      items,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) d.wishlists[idx] = entry;
    else d.wishlists.push(entry);
  });

  res.json({ items, added: items.some((i) => i.productId === productId) });
});

export default router;

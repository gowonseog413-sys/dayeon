import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function ensureCarts(db) {
  if (!Array.isArray(db.carts)) db.carts = [];
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of items) {
    const productId = String(raw?.productId || "").trim();
    const quantity = Math.max(1, Math.floor(Number(raw?.quantity) || 0));
    if (!productId || quantity <= 0) continue;
    let id = String(raw?.id || "").trim();
    if (!id || seen.has(id)) {
      id = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    seen.add(id);
    result.push({
      id,
      productId,
      quantity,
      savedAt: raw?.savedAt || new Date().toISOString(),
    });
  }
  return result.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
}

function findUserCart(db, userId) {
  ensureCarts(db);
  return db.carts.find((c) => c.userId === userId);
}

router.get("/", authRequired, (req, res) => {
  const db = readDb();
  const cart = findUserCart(db, req.user.sub);
  res.json({ items: cart?.items || [] });
});

router.put("/", authRequired, (req, res) => {
  const items = sanitizeItems(req.body?.items);
  const now = new Date().toISOString();

  updateDb((db) => {
    ensureCarts(db);
    const idx = db.carts.findIndex((c) => c.userId === req.user.sub);
    const entry = { userId: req.user.sub, items, updatedAt: now };
    if (idx >= 0) db.carts[idx] = entry;
    else db.carts.push(entry);
  });

  res.json({ items });
});

export default router;

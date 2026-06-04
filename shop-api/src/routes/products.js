import { Router } from "express";
import { readDb } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const { section, category, q } = req.query;
  let items = readDb().products;

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

router.get("/:id", (req, res) => {
  const product = readDb().products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  res.json({ product });
});

export default router;

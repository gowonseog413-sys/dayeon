import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";

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

router.get("/products", (_req, res) => {
  res.json({ products: readDb().products });
});

router.post("/products", (req, res) => {
  const product = {
    id: uuid(),
    brand: req.body.brand || "Brand",
    name: req.body.name || "New Product",
    category: req.body.category || "contact-lenses",
    section: req.body.section || "bloominc",
    priceOriginal: Number(req.body.priceOriginal) || 0,
    priceSale: Number(req.body.priceSale) || 0,
    badge: req.body.badge || null,
    image: req.body.image || "/placeholders/lens-gray.svg",
    colorSwatch: req.body.colorSwatch || "#ec4899",
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
    d.products[idx] = { ...d.products[idx], ...req.body, id: req.params.id };
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

router.get("/orders", (_req, res) => {
  const db = readDb();
  const orders = db.orders
    .map((o) => ({
      ...o,
      user: db.users.find((u) => u.id === o.userId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ orders });
});

router.patch("/orders/:id", (req, res) => {
  let updated = null;
  updateDb((d) => {
    const order = d.orders.find((o) => o.id === req.params.id);
    if (!order) return;
    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    updated = order;
  });
  if (!updated) return res.status(404).json({ error: "주문 없음" });
  res.json({ order: updated });
});

router.get("/users", (_req, res) => {
  const users = readDb().users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    createdAt: u.createdAt,
  }));
  res.json({ users });
});

export default router;

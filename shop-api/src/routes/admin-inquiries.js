import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";
import {
  adminInquiry,
  ensureInquiries,
  normalizeCategory,
} from "../inquiries.js";

const router = Router();
router.use(adminRequired);

router.get("/", (req, res) => {
  const db = readDb();
  ensureInquiries(db);
  const status = req.query.status;
  let items = [...db.inquiries];
  if (status === "pending" || status === "answered") {
    items = items.filter((i) => i.status === status);
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ inquiries: items.map(adminInquiry) });
});

router.get("/:id", (req, res) => {
  const db = readDb();
  ensureInquiries(db);
  const inq = db.inquiries.find((i) => i.id === req.params.id);
  if (!inq) return res.status(404).json({ error: "문의를 찾을 수 없습니다." });
  res.json({ inquiry: adminInquiry(inq) });
});

router.post("/:id/replies", (req, res) => {
  const { body } = req.body || {};
  if (!body?.trim()) {
    return res.status(400).json({ error: "답변 내용을 입력해 주세요." });
  }

  let updated = null;
  updateDb((d) => {
    ensureInquiries(d);
    const idx = d.inquiries.findIndex((i) => i.id === req.params.id);
    if (idx < 0) return;
    const now = new Date().toISOString();
    const reply = {
      id: uuid(),
      authorRole: "admin",
      authorId: req.user.sub,
      body: body.trim().slice(0, 5000),
      createdAt: now,
    };
    d.inquiries[idx].replies = [...(d.inquiries[idx].replies || []), reply];
    d.inquiries[idx].status = "answered";
    d.inquiries[idx].updatedAt = now;
    d.inquiries[idx].userReadAt = null;
    updated = d.inquiries[idx];
  });

  if (!updated) return res.status(404).json({ error: "문의를 찾을 수 없습니다." });
  res.json({ inquiry: adminInquiry(updated) });
});

router.patch("/:id", (req, res) => {
  let updated = null;
  updateDb((d) => {
    ensureInquiries(d);
    const idx = d.inquiries.findIndex((i) => i.id === req.params.id);
    if (idx < 0) return;
    const { status, category } = req.body || {};
    if (status === "pending" || status === "answered") {
      d.inquiries[idx].status = status;
    }
    if (category) {
      d.inquiries[idx].category = normalizeCategory(category);
    }
    d.inquiries[idx].updatedAt = new Date().toISOString();
    updated = d.inquiries[idx];
  });

  if (!updated) return res.status(404).json({ error: "문의를 찾을 수 없습니다." });
  res.json({ inquiry: adminInquiry(updated) });
});

router.delete("/:id", (req, res) => {
  let removed = false;
  updateDb((d) => {
    ensureInquiries(d);
    const before = d.inquiries.length;
    d.inquiries = d.inquiries.filter((i) => i.id !== req.params.id);
    removed = d.inquiries.length < before;
  });
  if (!removed) return res.status(404).json({ error: "문의를 찾을 수 없습니다." });
  res.json({ ok: true });
});

export default router;

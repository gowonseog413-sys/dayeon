import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import {
  ensureInquiries,
  findUser,
  normalizeCategory,
  publicInquiry,
  userDisplayName,
} from "../inquiries.js";

const router = Router();

router.get("/mine", authRequired, (req, res) => {
  const db = readDb();
  ensureInquiries(db);
  const items = db.inquiries
    .filter((i) => i.userId === req.user.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicInquiry);
  const unread = items.filter(
    (i) => i.status === "answered" && !i.userReadAt,
  ).length;
  res.json({ inquiries: items, unread });
});

router.get("/:id", authRequired, (req, res) => {
  const db = readDb();
  ensureInquiries(db);
  const inq = db.inquiries.find(
    (i) => i.id === req.params.id && i.userId === req.user.sub,
  );
  if (!inq) return res.status(404).json({ error: "문의를 찾을 수 없습니다." });
  res.json({ inquiry: publicInquiry(inq) });
});

router.post("/", authRequired, (req, res) => {
  const { category, subject, body, orderId, userName, userEmail, userPhone } =
    req.body || {};
  if (!subject?.trim()) {
    return res.status(400).json({ error: "제목을 입력해 주세요." });
  }
  if (!body?.trim()) {
    return res.status(400).json({ error: "문의 내용을 입력해 주세요." });
  }

  const db = readDb();
  ensureInquiries(db);
  const user = findUser(db, req.user.sub);
  const now = new Date().toISOString();

  const inquiry = {
    id: uuid(),
    userId: req.user.sub,
    category: normalizeCategory(category),
    subject: subject.trim().slice(0, 120),
    body: body.trim().slice(0, 5000),
    orderId: orderId?.trim()?.slice(0, 40) || null,
    status: "pending",
    userName: (userName || userDisplayName(user)).trim().slice(0, 80),
    userEmail: (userEmail || user?.email || "").trim().slice(0, 120),
    userPhone: (userPhone || user?.phone || "").trim().slice(0, 40),
    createdAt: now,
    updatedAt: now,
    userReadAt: now,
    replies: [],
  };

  updateDb((d) => {
    ensureInquiries(d);
    d.inquiries.push(inquiry);
  });

  res.status(201).json({ inquiry: publicInquiry(inquiry) });
});

router.post("/:id/read", authRequired, (req, res) => {
  let updated = null;
  updateDb((d) => {
    ensureInquiries(d);
    const idx = d.inquiries.findIndex(
      (i) => i.id === req.params.id && i.userId === req.user.sub,
    );
    if (idx < 0) return;
    d.inquiries[idx].userReadAt = new Date().toISOString();
    updated = d.inquiries[idx];
  });
  if (!updated) return res.status(404).json({ error: "문의를 찾을 수 없습니다." });
  res.json({ inquiry: publicInquiry(updated) });
});

export default router;

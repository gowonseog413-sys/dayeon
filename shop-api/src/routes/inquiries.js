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

router.post("/guest", (req, res) => {
  const { subject, body, userName, userEmail, userPhone } = req.body || {};
  if (!userName?.trim()) {
    return res.status(400).json({ error: "이름을 입력해 주세요." });
  }
  if (!userEmail?.trim() || !String(userEmail).includes("@")) {
    return res.status(400).json({ error: "올바른 이메일을 입력해 주세요." });
  }
  if (!userPhone?.trim()) {
    return res.status(400).json({ error: "연락 가능한 휴대폰 번호를 입력해 주세요." });
  }
  if (!body?.trim()) {
    return res.status(400).json({ error: "문의 내용을 입력해 주세요." });
  }

  const db = readDb();
  ensureInquiries(db);
  const now = new Date().toISOString();
  const inquiry = {
    id: uuid(),
    userId: "guest",
    category: "other",
    subject: (subject || "비밀번호/계정 문의").trim().slice(0, 120),
    body: body.trim().slice(0, 5000),
    orderId: null,
    status: "pending",
    userName: userName.trim().slice(0, 80),
    userEmail: userEmail.trim().slice(0, 120),
    userPhone: userPhone.trim().slice(0, 40),
    createdAt: now,
    updatedAt: now,
    userReadAt: null,
    replies: [],
  };

  updateDb((d) => {
    ensureInquiries(d);
    d.inquiries.push(inquiry);
  });

  res.status(201).json({
    inquiry: publicInquiry(inquiry),
    message: "문의가 접수되었습니다. 관리자 확인 후 연락드리겠습니다.",
  });
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

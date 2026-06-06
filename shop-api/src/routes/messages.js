import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import {
  countUnreadMessages,
  listUserMessages,
  markMessageRead,
  publicMessage,
} from "../user-messages.js";

const router = Router();

router.get("/mine", authRequired, (req, res) => {
  const db = readDb();
  const items = listUserMessages(db, req.user.id).map(publicMessage);
  res.json({
    messages: items,
    unread: countUnreadMessages(db, req.user.id),
  });
});

router.post("/:id/read", authRequired, (req, res) => {
  let updated = null;
  updateDb((d) => {
    updated = markMessageRead(d, req.user.id, req.params.id);
  });
  if (!updated) return res.status(404).json({ error: "메시지를 찾을 수 없습니다." });
  res.json({ message: publicMessage(updated) });
});

export default router;

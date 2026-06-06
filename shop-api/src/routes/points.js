import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import {
  ensurePointLedger,
  listUserPointHistory,
  listUserReferrals,
} from "../point-transactions.js";

const router = Router();

router.get("/history", authRequired, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 5));
  updateDb((d) => ensurePointLedger(d));
  const db = readDb();
  res.json(listUserPointHistory(db, req.user.sub, { page, pageSize }));
});

router.get("/referrals", authRequired, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 5));
  const db = readDb();
  res.json(listUserReferrals(db, req.user.sub, { page, pageSize }));
});

export default router;

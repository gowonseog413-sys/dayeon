import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";
import {
  ensurePaymentChannels,
  listEnabledChannels,
  maskProfile,
} from "../payment-methods.js";

const router = Router();
router.use(adminRequired);

router.get("/channels", (_req, res) => {
  const db = readDb();
  ensurePaymentChannels(db);
  res.json({ channels: db.paymentChannels });
});

router.put("/channels", (req, res) => {
  const incoming = Array.isArray(req.body?.channels) ? req.body.channels : null;
  if (!incoming?.length) {
    return res.status(400).json({ error: "채널 목록이 비어 있습니다." });
  }

  updateDb((d) => {
    ensurePaymentChannels(d);
    d.paymentChannels = incoming.map((c, i) => ({
      id: c.id || `ch-${i}`,
      type: c.type,
      nameKo: String(c.nameKo || "").trim(),
      nameId: String(c.nameId || "").trim(),
      descriptionKo: String(c.descriptionKo || "").trim(),
      descriptionId: String(c.descriptionId || "").trim(),
      jubelioCode: String(c.jubelioCode || "").trim(),
      enabled: Boolean(c.enabled),
      sortOrder: Number(c.sortOrder) || i + 1,
      vaBanks: Array.isArray(c.vaBanks) ? c.vaBanks : [],
    }));
  });

  res.json({ channels: readDb().paymentChannels });
});

router.get("/profiles", (_req, res) => {
  const db = readDb();
  ensurePaymentChannels(db);
  const users = db.users;
  const rows = db.paymentProfiles
    .map((p) => {
      const user = users.find((u) => u.id === p.userId);
      return {
        ...maskProfile(p),
        userName: user
          ? `${user.firstName || ""}${user.lastName ? ` ${user.lastName}` : ""}`.trim()
          : "-",
        userEmail: user?.email || "-",
      };
    })
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  res.json({ profiles: rows, channels: listEnabledChannels(db) });
});

export default router;

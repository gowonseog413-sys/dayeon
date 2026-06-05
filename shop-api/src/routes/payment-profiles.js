import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import {
  ensurePaymentChannels,
  listEnabledChannels,
  maskProfile,
  VA_BANKS,
} from "../payment-methods.js";

const router = Router();
router.use(authRequired);

function userProfiles(db, userId) {
  ensurePaymentChannels(db);
  return db.paymentProfiles
    .filter((p) => p.userId === userId)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function validateBody(body, db) {
  const channelType = String(body.channelType || "").trim();
  const enabled = listEnabledChannels(db).some((c) => c.type === channelType);
  if (!enabled) return { error: "사용할 수 없는 결제 유형입니다." };

  const label = String(body.label || "").trim();
  if (!label) return { error: "표시 이름을 입력해 주세요." };

  if (channelType === "credit_card") {
    const cardLast4 = String(body.cardLast4 || "").replace(/\D/g, "").slice(-4);
    const cardHolder = String(body.cardHolder || "").trim();
    const expiryMonth = String(body.expiryMonth || "").padStart(2, "0").slice(0, 2);
    const expiryYear = String(body.expiryYear || "").slice(-2);
    if (cardLast4.length !== 4) return { error: "카드 번호 끝 4자리를 입력해 주세요." };
    if (!cardHolder) return { error: "카드 소유자명을 입력해 주세요." };
    return {
      channelType,
      label,
      cardBrand: String(body.cardBrand || "visa").trim(),
      cardLast4,
      cardHolder,
      expiryMonth,
      expiryYear,
    };
  }

  if (channelType === "gopay") {
    const gopayPhone = String(body.gopayPhone || "").replace(/\s/g, "");
    if (!/^08\d{8,11}$/.test(gopayPhone)) {
      return { error: "GoPay 연동 휴대폰 번호(08…)를 입력해 주세요." };
    }
    return { channelType, label, gopayPhone };
  }

  if (channelType === "virtual_account") {
    const vaBank = String(body.vaBank || "").trim();
    if (!VA_BANKS.includes(vaBank)) return { error: "가상계좌 은행을 선택해 주세요." };
    return { channelType, label, vaBank };
  }

  return { error: "결제 유형이 올바르지 않습니다." };
}

router.get("/", (req, res) => {
  const db = readDb();
  const profiles = userProfiles(db, req.user.sub).map(maskProfile);
  res.json({ profiles, channels: listEnabledChannels(db) });
});

router.post("/", (req, res) => {
  const db = readDb();
  const parsed = validateBody(req.body, db);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  const now = new Date().toISOString();
  const makeDefault = Boolean(req.body.isDefault);
  let created = null;

  updateDb((d) => {
    ensurePaymentChannels(d);
    if (makeDefault) {
      d.paymentProfiles.forEach((p) => {
        if (p.userId === req.user.sub) p.isDefault = false;
      });
    }
    const hasDefault = d.paymentProfiles.some(
      (p) => p.userId === req.user.sub && p.isDefault,
    );
    created = {
      id: uuid(),
      userId: req.user.sub,
      ...parsed,
      isDefault: makeDefault || !hasDefault,
      createdAt: now,
      updatedAt: now,
    };
    d.paymentProfiles.push(created);
  });

  res.status(201).json({ profile: maskProfile(created) });
});

router.put("/:id", (req, res) => {
  let updated = null;
  const db = readDb();
  const parsed = validateBody(req.body, db);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  updateDb((d) => {
    ensurePaymentChannels(d);
    const idx = d.paymentProfiles.findIndex(
      (p) => p.id === req.params.id && p.userId === req.user.sub,
    );
    if (idx === -1) return;
    if (req.body.isDefault) {
      d.paymentProfiles.forEach((p) => {
        if (p.userId === req.user.sub) p.isDefault = false;
      });
    }
    d.paymentProfiles[idx] = {
      ...d.paymentProfiles[idx],
      ...parsed,
      isDefault: Boolean(req.body.isDefault) || d.paymentProfiles[idx].isDefault,
      updatedAt: new Date().toISOString(),
    };
    updated = d.paymentProfiles[idx];
  });

  if (!updated) return res.status(404).json({ error: "결제수단 없음" });
  res.json({ profile: maskProfile(updated) });
});

router.patch("/:id/default", (req, res) => {
  let updated = null;
  updateDb((d) => {
    ensurePaymentChannels(d);
    d.paymentProfiles.forEach((p) => {
      if (p.userId === req.user.sub) p.isDefault = false;
    });
    const item = d.paymentProfiles.find(
      (p) => p.id === req.params.id && p.userId === req.user.sub,
    );
    if (!item) return;
    item.isDefault = true;
    item.updatedAt = new Date().toISOString();
    updated = item;
  });
  if (!updated) return res.status(404).json({ error: "결제수단 없음" });
  res.json({ profile: maskProfile(updated) });
});

router.delete("/:id", (req, res) => {
  let found = false;
  updateDb((d) => {
    ensurePaymentChannels(d);
    const before = d.paymentProfiles.length;
    const removed = d.paymentProfiles.find(
      (p) => p.id === req.params.id && p.userId === req.user.sub,
    );
    d.paymentProfiles = d.paymentProfiles.filter(
      (p) => !(p.id === req.params.id && p.userId === req.user.sub),
    );
    found = d.paymentProfiles.length < before;
    if (found && removed?.isDefault) {
      const next = d.paymentProfiles.find((p) => p.userId === req.user.sub);
      if (next) next.isDefault = true;
    }
  });
  if (!found) return res.status(404).json({ error: "결제수단 없음" });
  res.json({ ok: true });
});

export default router;

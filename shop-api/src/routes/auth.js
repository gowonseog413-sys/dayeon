import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired, signToken } from "../middleware/auth.js";
import {
  buildGoogleAuthUrl,
  decodeOAuthState,
  encodeOAuthState,
  exchangeCodeForProfile,
  isGoogleOAuthConfigured,
} from "../oauth/google.js";
import { findOrCreateGoogleUser } from "../oauth/users.js";
import { recordUserLogin } from "../user-login.js";
import { ensureMemberSettings, referralCodeForUser } from "../member-settings.js";
import { applySignupBonus } from "../points-rewards.js";
import { isProfileComplete } from "../profile-complete.js";
import { resolveFrontendUrl, sanitizeOAuthNext } from "../frontend-url.js";
import { applyReferralRewards, resolveReferrerId } from "../referral-signup.js";
import { syncUserTier } from "../user-tier.js";
import {
  birthDatesMatch,
  canResetPassword,
  namesMatch,
  normalizeBirthDate,
  parseRegistrationName,
  phonesMatch,
} from "../password-reset.js";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3600";

router.post("/register", async (req, res) => {
  const { email, password, passwordConfirm, referralCode, phone, address, birthDate } = req.body;
  const { firstName, lastName } = parseRegistrationName(req.body);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").trim();
  const normalizedBirthDate = normalizeBirthDate(birthDate);
  const normalizedAddress = String(address || "").trim();
  const nextPassword = String(password || "");
  const confirm = String(passwordConfirm || "");

  if (!normalizedEmail || !nextPassword || !firstName || !normalizedPhone || !normalizedBirthDate) {
    return res.status(400).json({ error: "이름, 이메일, 비밀번호, 휴대폰, 생년월일을 입력해 주세요." });
  }
  if (nextPassword.length < 6) {
    return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
  }
  if (nextPassword !== confirm) {
    return res.status(400).json({ error: "비밀번호가 일치하지 않습니다." });
  }

  const db = readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    if (!existing.passwordHash) {
      return res.status(409).json({ error: "이 이메일은 Google 로그인을 사용합니다." });
    }
    return res.status(409).json({ error: "이미 가입된 이메일입니다." });
  }

  ensureMemberSettings(db);
  const referredBy = resolveReferrerId(db, referralCode);

  const user = {
    id: uuid(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(nextPassword, 10),
    authProvider: "local",
    googleId: null,
    avatarUrl: null,
    firstName,
    lastName: lastName || "",
    birthDate: normalizedBirthDate,
    phone: normalizedPhone,
    address: normalizedAddress || null,
    role: "customer",
    points: 0,
    tier: "bronze",
    referredBy,
    loginCount: 0,
    createdAt: new Date().toISOString(),
  };
  user.referralCode = referralCodeForUser(user);

  updateDb((d) => {
    ensureMemberSettings(d);
    d.users.push(user);
    applySignupBonus(d, user);
    if (referredBy) {
      applyReferralRewards(d, user, referredBy);
    }
  });
  recordUserLogin(user.id);
  const fresh = readDb().users.find((u) => u.id === user.id) || user;

  const token = signToken(fresh);
  res.status(201).json({
    token,
    user: publicUser(fresh),
  });
});

router.post("/login", async (req, res) => {
  const { email, password, erpPortal: erpPortalReq } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.email === email?.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }
  if (!user.passwordHash) {
    return res.status(401).json({
      error: "이 계정은 Google 로그인을 사용합니다.",
    });
  }
  if (!(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const wantsErpPortal = erpPortalReq === true;
  if (wantsErpPortal && user.role !== "admin") {
    return res.status(403).json({ error: "관리자 권한이 없습니다." });
  }
  if (!wantsErpPortal && user.role === "admin") {
    return res.status(403).json({
      error:
        "관리자 계정은 쇼핑몰 로그인이 아닌 푸터의 「관리자페이지」에서 ERP에 접속해 주세요.",
    });
  }

  if (wantsErpPortal) recordUserLogin(user.id);
  const fresh = readDb().users.find((u) => u.id === user.id) || user;
  res.json({
    token: signToken(fresh, { erpPortal: wantsErpPortal }),
    user: publicUser(fresh),
  });
});

router.get("/google", (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      error: "Google OAuth가 설정되지 않았습니다. shop-api/.env 파일을 확인하세요.",
    });
  }
  const next = sanitizeOAuthNext(req.query.next);
  const origin =
    typeof req.query.origin === "string" ? req.query.origin.trim() : "";
  const state = encodeOAuthState({ next, origin, n: uuid().slice(0, 8) });
  res.redirect(buildGoogleAuthUrl(state));
});

router.get("/google/callback", async (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }

  const { code, state, error } = req.query;
  const decoded = decodeOAuthState(typeof state === "string" ? state : "");
  const next = sanitizeOAuthNext(decoded.next);
  const frontendUrl = resolveFrontendUrl(decoded.origin);

  if (error || !code) {
    return res.redirect(
      `${frontendUrl}/login?error=google_denied&next=${encodeURIComponent(next)}`,
    );
  }

  try {
    const profile = await exchangeCodeForProfile(String(code));
    const user = findOrCreateGoogleUser(profile);
    recordUserLogin(user.id);
    const fresh = readDb().users.find((u) => u.id === user.id) || user;
    const token = signToken(fresh, { erpPortal: false });
    const params = new URLSearchParams({ token, next });
    res.redirect(`${frontendUrl}/auth/callback?${params}`);
  } catch (e) {
    console.error("Google OAuth error:", e);
    res.redirect(
      `${frontendUrl}/login?error=google_failed&next=${encodeURIComponent(next)}`,
    );
  }
});

router.get("/google/status", (_req, res) => {
  res.json({ configured: isGoogleOAuthConfigured() });
});

router.post("/complete-profile", authRequired, async (req, res) => {
  const { referralCode, phone, address, birthDate } = req.body ?? {};
  const { firstName, lastName } = parseRegistrationName(req.body);
  const normalizedPhone = String(phone || "").trim();
  const normalizedBirthDate = normalizeBirthDate(birthDate);
  const normalizedAddress = String(address || "").trim();

  if (!firstName || !normalizedPhone || !normalizedBirthDate) {
    return res.status(400).json({ error: "이름, 휴대폰, 생년월일을 입력해 주세요." });
  }

  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === req.user.sub);
  if (idx < 0) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

  const user = db.users[idx];
  if (isProfileComplete(user)) {
    return res.status(400).json({ error: "이미 정회원 가입이 완료되었습니다." });
  }

  user.firstName = firstName;
  user.lastName = lastName || "";
  user.phone = normalizedPhone;
  user.birthDate = normalizedBirthDate;
  user.address = normalizedAddress || null;
  user.updatedAt = new Date().toISOString();

  updateDb((d) => {
    const u = d.users.find((x) => x.id === user.id);
    if (!u) return;
    u.firstName = user.firstName;
    u.lastName = user.lastName;
    u.phone = user.phone;
    u.birthDate = user.birthDate;
    u.address = user.address;
    u.updatedAt = user.updatedAt;
    const referrerId = resolveReferrerId(d, referralCode, u.id);
    if (referrerId) {
      applyReferralRewards(d, u, referrerId);
    }
    syncUserTier(d, u.id, d.settings.points);
  });

  const fresh = readDb().users.find((u) => u.id === user.id) || user;
  res.json({
    user: publicUser(fresh),
    message: "정회원 가입이 완료되었습니다.",
  });
});

router.post("/verify-identity", async (req, res) => {
  const { email, name, phone, birthDate } = req.body ?? {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedName = String(name || "").trim();
  const normalizedPhone = String(phone || "").trim();
  const normalizedBirthDate = normalizeBirthDate(birthDate);

  if (!normalizedEmail || !normalizedName || !normalizedPhone) {
    return res.status(400).json({ error: "이메일, 이름, 휴대폰을 입력해 주세요." });
  }

  const db = readDb();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: "등록되지 않은 이메일입니다." });
  }

  const eligibility = canResetPassword(user);
  if (!eligibility.ok) {
    return res.status(400).json({ error: eligibility.error });
  }
  if (user.birthDate && !normalizedBirthDate) {
    return res.status(400).json({ error: "생년월일을 입력해 주세요." });
  }
  if (!namesMatch(user, normalizedName)) {
    return res.status(400).json({ error: "가입 시 등록한 이름과 일치하지 않습니다." });
  }
  if (!phonesMatch(user, normalizedPhone)) {
    return res.status(400).json({ error: "가입 시 등록한 휴대폰 번호와 일치하지 않습니다." });
  }
  if (user.birthDate && !birthDatesMatch(user, normalizedBirthDate)) {
    return res.status(400).json({ error: "가입 시 등록한 생년월일과 일치하지 않습니다." });
  }

  res.json({
    ok: true,
    verified: true,
    message: "본인 확인이 완료되었습니다. 새 비밀번호를 설정해 주세요.",
    email: user.email,
  });
});

router.post("/forgot-password", async (req, res) => {
  const { email, name, phone, birthDate, password, passwordConfirm } = req.body ?? {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedName = String(name || "").trim();
  const normalizedPhone = String(phone || "").trim();
  const normalizedBirthDate = normalizeBirthDate(birthDate);
  const nextPassword = String(password || "");
  const confirm = String(passwordConfirm || "");

  if (!normalizedEmail || !normalizedName || !normalizedPhone || !nextPassword) {
    return res.status(400).json({ error: "필수 항목을 모두 입력해 주세요." });
  }
  if (nextPassword.length < 6) {
    return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
  }
  if (nextPassword !== confirm) {
    return res.status(400).json({ error: "새 비밀번호가 일치하지 않습니다." });
  }

  const db = readDb();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: "등록되지 않은 이메일입니다." });
  }

  const eligibility = canResetPassword(user);
  if (!eligibility.ok) {
    return res.status(400).json({ error: eligibility.error });
  }
  if (user.birthDate && !normalizedBirthDate) {
    return res.status(400).json({ error: "생년월일을 입력해 주세요." });
  }
  if (!namesMatch(user, normalizedName)) {
    return res.status(400).json({ error: "가입 시 등록한 이름과 일치하지 않습니다." });
  }
  if (!phonesMatch(user, normalizedPhone)) {
    return res.status(400).json({ error: "가입 시 등록한 휴대폰 번호와 일치하지 않습니다." });
  }
  if (user.birthDate && !birthDatesMatch(user, normalizedBirthDate)) {
    return res.status(400).json({ error: "가입 시 등록한 생년월일과 일치하지 않습니다." });
  }

  const passwordHash = await bcrypt.hash(nextPassword, 10);
  updateDb((d) => {
    const idx = d.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      d.users[idx].passwordHash = passwordHash;
      d.users[idx].updatedAt = new Date().toISOString();
    }
  });

  res.json({ ok: true, message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요." });
});

router.post("/change-password", authRequired, async (req, res) => {
  const { currentPassword, password, passwordConfirm, name, phone, birthDate } = req.body ?? {};
  const nextPassword = String(password || "");
  const confirm = String(passwordConfirm || "");

  if (!nextPassword) {
    return res.status(400).json({ error: "새 비밀번호를 입력해 주세요." });
  }
  if (nextPassword.length < 6) {
    return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
  }
  if (nextPassword !== confirm) {
    return res.status(400).json({ error: "새 비밀번호가 일치하지 않습니다." });
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

  if (!user.passwordHash) {
    return res.status(400).json({
      error: "이 계정은 소셜 로그인을 사용합니다. 해당 서비스에서 비밀번호를 관리해 주세요.",
    });
  }

  const hasCurrent = Boolean(String(currentPassword || ""));
  const hasIdentity =
    Boolean(String(name || "").trim()) &&
    Boolean(String(phone || "").trim()) &&
    Boolean(normalizeBirthDate(birthDate));

  if (hasCurrent) {
    if (!(await bcrypt.compare(String(currentPassword), user.passwordHash))) {
      return res.status(400).json({ error: "현재 비밀번호가 올바르지 않습니다." });
    }
  } else if (hasIdentity) {
    if (!namesMatch(user, String(name).trim())) {
      return res.status(400).json({ error: "이름이 일치하지 않습니다." });
    }
    if (!phonesMatch(user, String(phone).trim())) {
      return res.status(400).json({ error: "휴대폰 번호가 일치하지 않습니다." });
    }
    if (user.birthDate && !birthDatesMatch(user, birthDate)) {
      return res.status(400).json({ error: "생년월일이 일치하지 않습니다." });
    }
  } else {
    return res.status(400).json({
      error: "현재 비밀번호 또는 이름·휴대폰·생년월일로 본인 확인이 필요합니다.",
    });
  }

  const passwordHash = await bcrypt.hash(nextPassword, 10);
  updateDb((d) => {
    const idx = d.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      d.users[idx].passwordHash = passwordHash;
      d.users[idx].updatedAt = new Date().toISOString();
    }
  });

  res.json({ ok: true, message: "비밀번호가 변경되었습니다." });
});

router.get("/me", authRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json({ user: publicUser(user) });
});

function normalizeShippingAddress(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name || "").trim();
  const phone = String(raw.phone || "").trim();
  const address = String(raw.address || "").trim();
  const city = String(raw.city || "Jakarta").trim() || "Jakarta";
  const postalCode = String(raw.postalCode || "").trim();
  if (!name && !phone && !address) return null;
  return { name, phone, address, city, postalCode };
}

router.patch("/me", authRequired, (req, res) => {
  const { name, email, birthDate, phone, address, shippingAddress, addressSameAsShipping } =
    req.body ?? {};
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === req.user.sub);
  if (idx < 0) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

  const user = db.users[idx];

  if (email !== undefined) {
    const nextEmail = String(email).trim().toLowerCase();
    if (!nextEmail || !nextEmail.includes("@")) {
      return res.status(400).json({ error: "올바른 이메일을 입력해 주세요." });
    }
    const taken = db.users.find(
      (u) => u.id !== user.id && u.email.toLowerCase() === nextEmail,
    );
    if (taken) {
      return res.status(409).json({ error: "이미 사용 중인 이메일입니다." });
    }
    user.email = nextEmail;
  }

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      return res.status(400).json({ error: "이름을 입력해 주세요." });
    }
    const space = trimmed.indexOf(" ");
    if (space === -1) {
      user.firstName = trimmed;
      user.lastName = "";
    } else {
      user.firstName = trimmed.slice(0, space);
      user.lastName = trimmed.slice(space + 1).trim();
    }
  }

  if (birthDate !== undefined) {
    user.birthDate = birthDate ? String(birthDate).trim() : null;
  }
  if (phone !== undefined) {
    user.phone = phone ? String(phone).trim() : null;
  }
  if (shippingAddress !== undefined) {
    user.shippingAddress = normalizeShippingAddress(shippingAddress);
  }
  if (addressSameAsShipping !== undefined) {
    user.addressSameAsShipping = Boolean(addressSameAsShipping);
  }
  if (address !== undefined) {
    user.address = address ? String(address).trim() : null;
  }

  if (user.addressSameAsShipping && user.shippingAddress?.address) {
    user.address = user.shippingAddress.address;
    if (!user.phone && user.shippingAddress.phone) {
      user.phone = user.shippingAddress.phone;
    }
  }

  user.updatedAt = new Date().toISOString();

  updateDb((d) => {
    d.users[idx] = user;
  });

  res.json({ user: publicUser(user) });
});

function publicUser(u) {
  const points = Number(u.points) || 0;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    authProvider: u.authProvider || "local",
    avatarUrl: u.avatarUrl || null,
    birthDate: u.birthDate || null,
    phone: u.phone || null,
    address: u.address || null,
    shippingAddress: u.shippingAddress || null,
    addressSameAsShipping: Boolean(u.addressSameAsShipping),
    profileComplete: isProfileComplete(u),
    points,
    tier: u.tier || "bronze",
  };
}

export default router;

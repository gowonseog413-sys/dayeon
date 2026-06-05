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
import { computeUserTier } from "../user-tier.js";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3600";

router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, referralCode } = req.body;
  if (!email || !password || !firstName) {
    return res.status(400).json({ error: "필수 항목을 입력해 주세요." });
  }

  const db = readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (!existing.passwordHash) {
      return res.status(409).json({ error: "이 이메일은 Google 로그인을 사용합니다." });
    }
    return res.status(409).json({ error: "이미 가입된 이메일입니다." });
  }

  ensureMemberSettings(db);
  const refSettings = db.settings.referral;
  let referredBy = null;
  let signupPoints = 0;

  if (referralCode && refSettings.enabled) {
    const code = String(referralCode).trim().toUpperCase();
    const referrer = db.users.find(
      (u) => referralCodeForUser(u).toUpperCase() === code || u.referralCode?.toUpperCase() === code,
    );
    if (referrer && referrer.role !== "admin") {
      referredBy = referrer.id;
      signupPoints = refSettings.refereeReward || 0;
    }
  }

  const user = {
    id: uuid(),
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    authProvider: "local",
    googleId: null,
    avatarUrl: null,
    firstName,
    lastName: lastName || "",
    role: "customer",
    points: signupPoints,
    referredBy,
    loginCount: 0,
    createdAt: new Date().toISOString(),
  };
  user.referralCode = referralCodeForUser(user);

  updateDb((d) => {
    ensureMemberSettings(d);
    d.users.push(user);
    if (referredBy && refSettings.enabled) {
      const referrer = d.users.find((u) => u.id === referredBy);
      if (referrer) {
        referrer.points = (Number(referrer.points) || 0) + (refSettings.referrerReward || 0);
        referrer.tier = computeUserTier(referrer.points, d.settings.points);
      }
      if (signupPoints > 0) {
        user.tier = computeUserTier(signupPoints, d.settings.points);
      }
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
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.email === email?.toLowerCase());
  if (!user?.passwordHash) {
    return res.status(401).json({
      error: "이 계정은 Google 로그인을 사용합니다.",
    });
  }
  if (!(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }
  recordUserLogin(user.id);
  const fresh = readDb().users.find((u) => u.id === user.id) || user;
  res.json({ token: signToken(fresh), user: publicUser(fresh) });
});

router.get("/google", (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      error: "Google OAuth가 설정되지 않았습니다. shop-api/.env 파일을 확인하세요.",
    });
  }
  const next = typeof req.query.next === "string" ? req.query.next : "/";
  const state = encodeOAuthState({ next, n: uuid().slice(0, 8) });
  res.redirect(buildGoogleAuthUrl(state));
});

router.get("/google/callback", async (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }

  const { code, state, error } = req.query;
  const { next } = decodeOAuthState(typeof state === "string" ? state : "");

  if (error || !code) {
    return res.redirect(
      `${FRONTEND_URL}/login?error=google_denied&next=${encodeURIComponent(next)}`,
    );
  }

  try {
    const profile = await exchangeCodeForProfile(String(code));
    const user = findOrCreateGoogleUser(profile);
    recordUserLogin(user.id);
    const fresh = readDb().users.find((u) => u.id === user.id) || user;
    const token = signToken(fresh);
    const dest =
      user.role === "admin" && !next.startsWith("/checkout") ? "/erp" : next;
    const params = new URLSearchParams({ token, next: dest });
    res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
  } catch (e) {
    console.error("Google OAuth error:", e);
    res.redirect(
      `${FRONTEND_URL}/login?error=google_failed&next=${encodeURIComponent(next)}`,
    );
  }
});

router.get("/google/status", (_req, res) => {
  res.json({ configured: isGoogleOAuthConfigured() });
});

router.get("/me", authRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json({ user: publicUser(user) });
});

router.patch("/me", authRequired, (req, res) => {
  const { name, email, birthDate, phone, address } = req.body ?? {};
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
  if (address !== undefined) {
    user.address = address ? String(address).trim() : null;
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
    points,
    tier: u.tier || computeUserTier(points),
  };
}

export default router;

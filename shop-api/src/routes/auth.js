import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { authRequired, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName) {
    return res.status(400).json({ error: "필수 항목을 입력해 주세요." });
  }

  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "이미 가입된 이메일입니다." });
  }

  const user = {
    id: uuid(),
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    firstName,
    lastName: lastName || "",
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  updateDb((d) => {
    d.users.push(user);
  });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: publicUser(user),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.email === email?.toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get("/me", authRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json({ user: publicUser(user) });
});

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
  };
}

export default router;

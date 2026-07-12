import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayeon-shop-dev-secret";

/** JWT sub 중복 시에도 이메일로 정확한 사용자 조회 */
export function resolveDbUser(db, tokenUser) {
  if (!tokenUser || !db?.users) return null;
  const email = String(tokenUser.email || "").toLowerCase();
  if (email) {
    const byEmail = db.users.find((u) => u.email?.toLowerCase() === email);
    if (byEmail) return byEmail;
  }
  if (tokenUser.sub) {
    return db.users.find((u) => u.id === tokenUser.sub) || null;
  }
  return null;
}

export function signToken(user, options = {}) {
  const erpPortal = options.erpPortal === true;
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, erpPortal },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "세션이 만료되었습니다." });
  }
}

export function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "관리자 권한이 필요합니다." });
    }
    if (req.user.erpPortal !== true) {
      return res.status(403).json({
        error: "ERP는 관리자페이지(관리자 대문)를 통해서만 접속할 수 있습니다.",
      });
    }
    next();
  });
}

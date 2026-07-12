import { Router } from "express";
import bcrypt from "bcryptjs";
import { readDb, updateDb } from "../db.js";
import { adminRequired, resolveDbUser } from "../middleware/auth.js";
import {
  ALL_PERMISSION_IDS,
  ERP_PERMISSION_GROUPS,
  countStaffByPermission,
  createAdminStaff,
  deleteAdminStaff,
  effectivePermissions,
  hasPermission,
  isMasterUser,
  MASTER_EMAIL,
  listAdminStaff,
  publicStaffRow,
  updateAdminStaff,
} from "../erp-permissions.js";

const router = Router();
router.use(adminRequired);

function currentUser(req) {
  const db = readDb();
  const user = resolveDbUser(db, req.user);
  return { db, user };
}

function masterOnly(req, res, next) {
  const { user } = currentUser(req);
  const master =
    (user && isMasterUser(user)) ||
    String(req.user?.email || "").toLowerCase() === MASTER_EMAIL;
  if (!master) {
    return res.status(403).json({ error: "마스터 관리자만 접근할 수 있습니다." });
  }
  next();
}

router.get("/groups", (_req, res) => {
  res.json({ groups: ERP_PERMISSION_GROUPS });
});

router.get("/me", (req, res) => {
  const { user } = currentUser(req);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json({
    email: user.email,
    isMaster: isMasterUser(user),
    permissions: effectivePermissions(user),
    groups: ERP_PERMISSION_GROUPS,
  });
});

router.get("/staff", masterOnly, (_req, res) => {
  const db = readDb();
  const staff = listAdminStaff(db);
  res.json({
    staff,
    counts: countStaffByPermission(staff),
    masterEmail: "dayeon@naver.com",
    allPermissionIds: ALL_PERMISSION_IDS,
  });
});

router.post("/staff", masterOnly, async (req, res) => {
  try {
    const password = String(req.body.password || "");
    if (password.length < 6) {
      return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let created;
    updateDb((db) => {
      created = createAdminStaff(db, { ...req.body, passwordHash });
    });
    res.status(201).json({ staff: created });
  } catch (err) {
    res.status(400).json({ error: err.message || "사원 등록 실패" });
  }
});

router.patch("/staff/:id", masterOnly, async (req, res) => {
  try {
    const patch = { ...req.body };
    if (patch.password) {
      const password = String(patch.password);
      if (password.length < 6) {
        return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
      }
      patch.passwordHash = await bcrypt.hash(password, 10);
      delete patch.password;
    }
    let updated;
    updateDb((db) => {
      updated = updateAdminStaff(db, req.params.id, patch);
    });
    res.json({ staff: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || "사원 수정 실패" });
  }
});

router.delete("/staff/:id", masterOnly, (req, res) => {
  try {
    updateDb((db) => {
      deleteAdminStaff(db, req.params.id);
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message || "사원 삭제 실패" });
  }
});

export function requireErpPermission(permissionId) {
  return (req, res, next) => {
    const { user } = currentUser(req);
    if (!user) return res.status(401).json({ error: "인증이 필요합니다." });
    if (!hasPermission(user, permissionId)) {
      return res.status(403).json({ error: "이 기능에 대한 권한이 없습니다." });
    }
    next();
  };
}

export default router;

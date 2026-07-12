import { v4 as uuid } from "uuid";
import { referralCodeForUser } from "./member-settings.js";

export const MASTER_EMAIL = "dayeon@naver.com";

export const ERP_PERMISSION_GROUPS = [
  { id: "permissions", label: "권한 관리", desc: "사원 등록·권한 부여" },
  { id: "dashboard", label: "대시보드·통계", desc: "대시보드, 통계보드, 카운터" },
  { id: "users", label: "회원 관리", desc: "회원, 포인트, 리뷰, 추천인" },
  { id: "orders", label: "주문 관리", desc: "주문·배송·반품·통계" },
  { id: "payments", label: "결제수단관리", desc: "결제 채널, 회원 결제수단" },
  { id: "products", label: "상품 관리", desc: "등록·목록·재고·카테고리" },
  { id: "content", label: "언론보도·하단문서", desc: "게시물, 약관, 고객센터" },
  { id: "theme", label: "테마변경", desc: "테마, 배너, 팝업, 채널" },
  { id: "settings", label: "환경설정", desc: "운영 환경, 접속 정보" },
];

export const ALL_PERMISSION_IDS = ERP_PERMISSION_GROUPS.map((g) => g.id);

export function isMasterUser(user) {
  return String(user?.email || "").toLowerCase() === MASTER_EMAIL;
}

export function normalizePermissions(list) {
  if (!Array.isArray(list)) return [];
  const allowed = new Set(ALL_PERMISSION_IDS);
  return [...new Set(list.filter((id) => allowed.has(id)))];
}

export function effectivePermissions(user) {
  if (!user || user.role !== "admin") return [];
  if (isMasterUser(user)) return [...ALL_PERMISSION_IDS];
  return normalizePermissions(user.erpPermissions);
}

export function hasPermission(user, permissionId) {
  return effectivePermissions(user).includes(permissionId);
}

function staffName(u) {
  return `${u.firstName || ""}${u.lastName ? ` ${u.lastName}` : ""}`.trim() || "-";
}

function normalizeHireDate(value) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function publicStaffRow(user) {
  const master = isMasterUser(user);
  return {
    id: user.id,
    email: user.email,
    name: staffName(user),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    department: user.department || "",
    position: user.position || "",
    phone: user.phone || "",
    address: user.address || "",
    hireDate:
      user.hireDate ||
      (user.createdAt ? String(user.createdAt).slice(0, 10) : null),
    status: user.adminStatus || "active",
    role: master ? "master" : "staff",
    permissions: effectivePermissions(user),
    createdAt: user.createdAt || null,
    lastLoginAt: user.lastLoginAt || null,
    loginCount: Number(user.loginCount) || 0,
  };
}

export function listAdminStaff(db) {
  return db.users
    .filter((u) => u.role === "admin")
    .map(publicStaffRow)
    .sort((a, b) => {
      if (a.role === "master") return -1;
      if (b.role === "master") return 1;
      return (a.email || "").localeCompare(b.email || "");
    });
}

export function countStaffByPermission(staffRows) {
  const counts = Object.fromEntries(ALL_PERMISSION_IDS.map((id) => [id, 0]));
  for (const row of staffRows) {
    for (const perm of row.permissions) {
      if (counts[perm] !== undefined) counts[perm] += 1;
    }
  }
  return counts;
}

export function createAdminStaff(db, body) {
  const email = String(body.email || "").trim().toLowerCase();
  const passwordHash = body.passwordHash;
  const firstName = String(body.firstName || "").trim();
  if (!email || !passwordHash || !firstName) {
    throw new Error("이메일, 비밀번호, 이름은 필수입니다.");
  }
  if (email === MASTER_EMAIL) {
    throw new Error("마스터 계정은 여기서 추가할 수 없습니다.");
  }
  if (db.users.some((u) => u.email?.toLowerCase() === email)) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  const user = {
    id: uuid(),
    email,
    passwordHash,
    authProvider: "local",
    googleId: null,
    avatarUrl: null,
    firstName,
    lastName: String(body.lastName || "").trim(),
    department: String(body.department || "").trim(),
    position: String(body.position || "").trim(),
    phone: String(body.phone || "").trim(),
    address: String(body.address || "").trim(),
    hireDate: normalizeHireDate(body.hireDate),
    adminStatus: body.status === "leave" ? "leave" : "active",
    role: "admin",
    adminRole: "staff",
    erpPermissions: normalizePermissions(body.permissions),
    points: 0,
    loginCount: 0,
    createdAt: new Date().toISOString(),
  };
  user.referralCode = referralCodeForUser(user);
  db.users.push(user);
  return publicStaffRow(user);
}

export function updateAdminStaff(db, id, body) {
  const user = db.users.find((u) => u.id === id && u.role === "admin");
  if (!user) throw new Error("관리자를 찾을 수 없습니다.");
  if (isMasterUser(user)) throw new Error("마스터 계정은 수정할 수 없습니다.");

  if (body.firstName !== undefined) user.firstName = String(body.firstName).trim();
  if (body.lastName !== undefined) user.lastName = String(body.lastName).trim();
  if (body.department !== undefined) user.department = String(body.department).trim();
  if (body.position !== undefined) user.position = String(body.position).trim();
  if (body.phone !== undefined) user.phone = String(body.phone).trim();
  if (body.address !== undefined) user.address = String(body.address).trim();
  if (body.hireDate !== undefined) user.hireDate = normalizeHireDate(body.hireDate);
  if (body.status !== undefined) {
    user.adminStatus = body.status === "leave" ? "leave" : "active";
  }
  if (body.permissions !== undefined) {
    user.erpPermissions = normalizePermissions(body.permissions);
  }
  if (body.passwordHash) {
    user.passwordHash = body.passwordHash;
  }
  return publicStaffRow(user);
}

export function deleteAdminStaff(db, id) {
  const user = db.users.find((u) => u.id === id && u.role === "admin");
  if (!user) throw new Error("관리자를 찾을 수 없습니다.");
  if (isMasterUser(user)) throw new Error("마스터 계정은 삭제할 수 없습니다.");
  db.users = db.users.filter((u) => u.id !== id);
  return { deleted: true };
}

export function ensureMasterPermissions(db) {
  const master = db.users.find((u) => isMasterUser(u));
  if (!master) return;
  master.role = "admin";
  master.adminRole = "master";
  master.erpPermissions = [...ALL_PERMISSION_IDS];
}

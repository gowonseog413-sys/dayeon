import { ensureMemberSettings } from "./member-settings.js";
import { getUserTotalPurchase, syncUserTier } from "./user-tier.js";

const TIER_RANK = { bronze: 0, silver: 1, gold: 2, diamond: 3 };

export const MEMBER_SORT_KEYS = [
  "createdAt",
  "totalPurchaseAmount",
  "purchaseCount",
  "tier",
  "points",
  "pointsUsed",
  "cartCount",
  "lastLoginAt",
  "loginCount",
];

function memberName(u) {
  return `${u.firstName || ""}${u.lastName ? ` ${u.lastName}` : ""}`.trim() || "-";
}

export function buildAdminMemberRows(db) {
  ensureMemberSettings(db);
  return [...db.users]
    .map((u) => {
      if (u.role !== "admin") syncUserTier(db, u.id, db.settings.points);
      const orders = db.orders.filter(
        (o) => o.userId === u.id && o.status !== "cancelled",
      );
      const totalPurchaseAmount = getUserTotalPurchase(db, u.id);
      const cart = (db.carts || []).find((c) => c.userId === u.id);
      const cartCount = Array.isArray(cart?.items) ? cart.items.length : 0;
      const paymentProfileCount = (db.paymentProfiles || []).filter(
        (p) => p.userId === u.id,
      ).length;
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        name: memberName(u),
        phone: u.phone || "",
        birthDate: u.birthDate || null,
        address: u.address || "",
        role: u.role,
        authProvider: u.authProvider || "local",
        avatarUrl: u.avatarUrl || null,
        tier: u.tier || "bronze",
        createdAt: u.createdAt || null,
        points: Number(u.points) || 0,
        pointsUsed: Number(u.pointsUsed) || 0,
        lastLoginAt: u.lastLoginAt || null,
        loginCount: Number(u.loginCount) || 0,
        totalPurchaseAmount,
        purchaseCount: orders.length,
        cartCount,
        paymentProfileCount,
      };
    });
}

function compareIso(a, b) {
  const ta = a ? new Date(a).getTime() : 0;
  const tb = b ? new Date(b).getTime() : 0;
  return ta - tb;
}

const MEMBER_SORT_CMP = {
  createdAt: (a, b) => compareIso(a.createdAt, b.createdAt),
  totalPurchaseAmount: (a, b) =>
    (Number(a.totalPurchaseAmount) || 0) - (Number(b.totalPurchaseAmount) || 0),
  purchaseCount: (a, b) => (Number(a.purchaseCount) || 0) - (Number(b.purchaseCount) || 0),
  tier: (a, b) =>
    (TIER_RANK[String(a.tier || "bronze").toLowerCase()] ?? 0) -
    (TIER_RANK[String(b.tier || "bronze").toLowerCase()] ?? 0),
  points: (a, b) => (Number(a.points) || 0) - (Number(b.points) || 0),
  pointsUsed: (a, b) => (Number(a.pointsUsed) || 0) - (Number(b.pointsUsed) || 0),
  cartCount: (a, b) => (Number(a.cartCount) || 0) - (Number(b.cartCount) || 0),
  lastLoginAt: (a, b) => compareIso(a.lastLoginAt, b.lastLoginAt),
  loginCount: (a, b) => (Number(a.loginCount) || 0) - (Number(b.loginCount) || 0),
};

export function normalizeMemberSort(sortBy, sortDir) {
  const key = MEMBER_SORT_KEYS.includes(sortBy) ? sortBy : "createdAt";
  const dir = sortDir === "asc" ? "asc" : "desc";
  return { sortBy: key, sortDir: dir };
}

export function sortMembers(rows, sortBy, sortDir) {
  const { sortBy: key, sortDir: dir } = normalizeMemberSort(sortBy, sortDir);
  const cmp = MEMBER_SORT_CMP[key];
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => cmp(a, b) * sign);
}

export function deleteMembersByIds(db, ids) {
  const idSet = new Set(Array.isArray(ids) ? ids : []);
  const skippedAdmin = db.users.filter((u) => idSet.has(u.id) && u.role === "admin").length;
  const deleteIds = new Set(
    db.users.filter((u) => idSet.has(u.id) && u.role !== "admin").map((u) => u.id),
  );
  if (deleteIds.size === 0) {
    return { deleted: 0, skippedAdmin };
  }
  db.users = db.users.filter((u) => !deleteIds.has(u.id));
  db.carts = (db.carts || []).filter((c) => !deleteIds.has(c.userId));
  db.paymentProfiles = (db.paymentProfiles || []).filter((p) => !deleteIds.has(p.userId));
  return { deleted: deleteIds.size, skippedAdmin };
}

export function paginateMembers(rows, page, pageSize) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const users = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { users, page: safePage, pageSize, total, totalPages };
}

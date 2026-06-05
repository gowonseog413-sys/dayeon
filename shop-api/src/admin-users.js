import { ensureMemberSettings } from "./member-settings.js";
import { computeUserTier } from "./user-tier.js";

function memberName(u) {
  return `${u.firstName || ""}${u.lastName ? ` ${u.lastName}` : ""}`.trim() || "-";
}

export function buildAdminMemberRows(db) {
  ensureMemberSettings(db);
  const tiers = db.settings.points;
  return [...db.users]
    .map((u) => {
      const orders = db.orders.filter(
        (o) => o.userId === u.id && o.status !== "cancelled",
      );
      const totalPurchaseAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
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
        address: u.address || "",
        role: u.role,
        authProvider: u.authProvider || "local",
        avatarUrl: u.avatarUrl || null,
        tier: u.tier || computeUserTier(u.points, tiers),
        createdAt: u.createdAt || null,
        points: Number(u.points) || 0,
        lastLoginAt: u.lastLoginAt || null,
        loginCount: Number(u.loginCount) || 0,
        totalPurchaseAmount,
        purchaseCount: orders.length,
        cartCount,
        paymentProfileCount,
      };
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
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

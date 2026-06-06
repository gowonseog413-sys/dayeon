export const INQUIRY_CATEGORIES = ["order", "delivery", "return", "product", "other"];

export const INQUIRY_CATEGORY_LABELS = {
  order: "주문/결제",
  delivery: "배송",
  return: "교환/반품",
  product: "상품",
  other: "기타",
};

export function ensureInquiries(db) {
  if (!Array.isArray(db.inquiries)) db.inquiries = [];
}

export function normalizeCategory(value) {
  return INQUIRY_CATEGORIES.includes(value) ? value : "other";
}

export function publicInquiry(inq) {
  return {
    id: inq.id,
    userId: inq.userId,
    category: inq.category,
    subject: inq.subject,
    body: inq.body,
    status: inq.status,
    orderId: inq.orderId || null,
    userName: inq.userName || "",
    userEmail: inq.userEmail || "",
    userPhone: inq.userPhone || "",
    createdAt: inq.createdAt,
    updatedAt: inq.updatedAt,
    userReadAt: inq.userReadAt || null,
    replies: (inq.replies || []).map((r) => ({
      id: r.id,
      authorRole: r.authorRole,
      body: r.body,
      createdAt: r.createdAt,
    })),
  };
}

export function adminInquiry(inq) {
  return publicInquiry(inq);
}

export function findUser(db, userId) {
  return db.users.find((u) => u.id === userId) || null;
}

export function userDisplayName(user) {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "";
}

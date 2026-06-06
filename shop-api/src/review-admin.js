import { v4 as uuid } from "uuid";

function memberName(user, fallback = "") {
  if (!user) return fallback || "-";
  const name = `${user.firstName || ""}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
  return name || user.email || fallback || "-";
}

export function enrichAdminReview(db, review) {
  const user = db.users.find((u) => u.id === review.userId);
  const product = db.products.find((p) => p.id === review.productId);
  return {
    ...review,
    userName: review.userName || memberName(user),
    userEmail: review.userEmailDisplay || user?.email || "",
    productName: product?.name || "",
    productBrand: product?.brand || "",
    productImage: product?.image || null,
  };
}

export function listAdminReviews(db, { scope = "all" } = {}) {
  let rows = db.reviews || [];
  if (scope === "member") rows = rows.filter((r) => !r.adminManaged);
  if (scope === "managed") rows = rows.filter((r) => r.adminManaged);
  return rows
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .map((r) => enrichAdminReview(db, r));
}

function parseRating(value) {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("별점은 1~5 사이로 선택해 주세요.");
  }
  return rating;
}

function parseCreatedAt(value) {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("등록일 형식이 올바르지 않습니다.");
  return d.toISOString();
}

export function createManagedReview(db, body) {
  if (!Array.isArray(db.reviews)) db.reviews = [];

  const productId = String(body.productId || "").trim();
  const product = db.products.find((p) => p.id === productId);
  if (!product) throw new Error("상품을 찾을 수 없습니다.");

  const content = String(body.content || "").trim();
  if (!content) throw new Error("리뷰 내용을 입력해 주세요.");

  const userName = String(body.userName || "").trim() || "고객";
  const userEmailDisplay = String(body.userEmail || "").trim();
  const userId = String(body.userId || "").trim() || "__managed__";

  const review = {
    id: uuid(),
    productId,
    userId,
    orderId: null,
    userName,
    userEmailDisplay: userEmailDisplay || undefined,
    rating: parseRating(body.rating),
    content,
    createdAt: parseCreatedAt(body.createdAt),
    adminManaged: true,
  };

  db.reviews.push(review);
  return enrichAdminReview(db, review);
}

export function updateManagedReview(db, id, body) {
  const review = (db.reviews || []).find((r) => r.id === id);
  if (!review) return null;
  if (!review.adminManaged) throw new Error("회원이 작성한 리뷰는 이 화면에서 수정할 수 없습니다.");

  if (body.productId !== undefined) {
    const productId = String(body.productId || "").trim();
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new Error("상품을 찾을 수 없습니다.");
    review.productId = productId;
  }
  if (body.userName !== undefined) {
    review.userName = String(body.userName || "").trim() || "고객";
  }
  if (body.userEmail !== undefined) {
    const email = String(body.userEmail || "").trim();
    review.userEmailDisplay = email || undefined;
  }
  if (body.rating !== undefined) review.rating = parseRating(body.rating);
  if (body.content !== undefined) {
    const content = String(body.content || "").trim();
    if (!content) throw new Error("리뷰 내용을 입력해 주세요.");
    review.content = content;
  }
  if (body.createdAt !== undefined) review.createdAt = parseCreatedAt(body.createdAt);

  return enrichAdminReview(db, review);
}

export function deleteReview(db, id) {
  if (!Array.isArray(db.reviews)) db.reviews = [];
  const before = db.reviews.length;
  db.reviews = db.reviews.filter((r) => r.id !== id);
  return db.reviews.length < before;
}

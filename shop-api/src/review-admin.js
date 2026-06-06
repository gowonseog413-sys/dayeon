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
    userEmail: user?.email || "",
    productName: product?.name || "",
    productBrand: product?.brand || "",
    productImage: product?.image || null,
  };
}

export function listAdminReviews(db) {
  return (db.reviews || [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => enrichAdminReview(db, r));
}

export type MemberSortKey =
  | "createdAt"
  | "totalPurchaseAmount"
  | "purchaseCount"
  | "tier"
  | "points"
  | "pointsUsed"
  | "cartCount"
  | "lastLoginAt"
  | "loginCount";

export type MemberSortDir = "asc" | "desc";

export const DEFAULT_MEMBER_SORT: { sortBy: MemberSortKey; sortDir: MemberSortDir } = {
  sortBy: "createdAt",
  sortDir: "desc",
};

const SORT_KEYS = new Set<string>([
  "createdAt",
  "totalPurchaseAmount",
  "purchaseCount",
  "tier",
  "points",
  "pointsUsed",
  "cartCount",
  "lastLoginAt",
  "loginCount",
]);

export function normalizeMemberSort(
  sortBy?: string | null,
  sortDir?: string | null,
): { sortBy: MemberSortKey; sortDir: MemberSortDir } {
  const key = sortBy && SORT_KEYS.has(sortBy) ? (sortBy as MemberSortKey) : "createdAt";
  const dir = sortDir === "asc" ? "asc" : "desc";
  return { sortBy: key, sortDir: dir };
}

export function memberSortQuery(sortBy: MemberSortKey, sortDir: MemberSortDir) {
  return `sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`;
}

export function toggleMemberSort(
  current: { sortBy: MemberSortKey; sortDir: MemberSortDir },
  column: MemberSortKey,
): { sortBy: MemberSortKey; sortDir: MemberSortDir } {
  if (current.sortBy === column) {
    return { sortBy: column, sortDir: current.sortDir === "desc" ? "asc" : "desc" };
  }
  return { sortBy: column, sortDir: "desc" };
}

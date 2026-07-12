import { isProfileComplete } from "@/lib/profile-complete";
import type { User } from "@/lib/types";

/** Google/소셜 로그인 후 쇼핑몰 전용 이동 경로 (ERP·관리자 대문 제외) */
export function resolveShopOAuthDest(next: string, user: User): string {
  const raw = (next || "/").trim();
  const blocked =
    raw.startsWith("/erp") ||
    raw.startsWith("/admin-gate") ||
    raw.startsWith("/login");

  if (!isProfileComplete(user)) {
    return "/register/complete";
  }

  if (blocked || raw === "/register") {
    return "/profile";
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
}

import { getApiBase } from "@/lib/api";

const API = getApiBase();

function sanitizeShopNextPath(nextPath: string) {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  if (next.startsWith("/erp") || next.startsWith("/admin-gate")) return "/";
  return next;
}

export function googleLoginUrl(nextPath = "/") {
  const next = sanitizeShopNextPath(nextPath);
  const params = new URLSearchParams({ next });
  if (typeof window !== "undefined") {
    params.set("origin", window.location.origin);
  }
  return `${API}/api/auth/google?${params}`;
}

export const OAUTH_ERRORS: Record<string, string> = {
  google_not_configured:
    "Google 로그인이 아직 설정되지 않았습니다. shop-api/.env에 Client ID를 넣어 주세요.",
  google_denied: "Google 로그인이 취소되었습니다.",
  google_failed: "Google 로그인에 실패했습니다. 다시 시도해 주세요.",
};

export function sanitizeOAuthNext(next) {
  const raw = typeof next === "string" ? next.trim() : "/";
  if (!raw || raw.startsWith("/erp") || raw.startsWith("/admin-gate")) {
    return "/";
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function resolveFrontendUrl(originHint) {
  const fallback = process.env.FRONTEND_URL || "http://localhost:3600";
  if (!originHint || typeof originHint !== "string") return fallback;

  try {
    const origin = new URL(originHint).origin;
    const allowed = (process.env.CORS_ORIGIN || "http://localhost:3600")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowed.includes(origin)) return origin;
  } catch {
    /* ignore invalid origin */
  }
  return fallback;
}

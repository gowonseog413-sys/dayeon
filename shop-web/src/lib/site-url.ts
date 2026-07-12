const PROD_SITE = "https://dayeon-shop.web.app";

export function getSiteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return PROD_SITE;
}

/** 클라이언트 공유 링크 — Facebook 등 외부 크롤러용 공개 URL */
export function getPublicSiteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return getSiteOrigin();
}

export function absoluteAssetUrl(path: string, origin = getSiteOrigin()) {
  if (!path) return `${origin}/placeholders/lens-gray.svg`;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 이벤트 팝업 노출 시간대 */
export const POPUP_TIMEZONES = {
  KR: "Asia/Seoul",
  ID: "Asia/Jakarta",
};

const geoCache = new Map();
const GEO_CACHE_MS = 60 * 60 * 1000;

export function timezoneForCountry(country) {
  if (country === "ID") return POPUP_TIMEZONES.ID;
  return POPUP_TIMEZONES.KR;
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "";
}

export function isPrivateOrLocalIp(ip) {
  const v = String(ip || "").replace("::ffff:", "");
  if (!v || v === "::1") return true;
  if (v.startsWith("127.")) return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  return false;
}

export function countryFromHeaders(req) {
  const raw =
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    req.headers["x-appengine-country"] ||
    req.headers["x-visitor-country"] ||
    req.query?.country;
  if (!raw) return null;
  return String(raw).toUpperCase().slice(0, 2);
}

/** 로컬·사설 IP, 헤더 없음 → 한국(ERP 테스트) */
export function resolveCountrySync(req) {
  const fromHeader = countryFromHeaders(req);
  if (fromHeader) return fromHeader;
  if (isPrivateOrLocalIp(getClientIp(req))) return "KR";
  return null;
}

async function countryFromIpLookup(ip) {
  if (!ip || isPrivateOrLocalIp(ip)) return "KR";
  const cached = geoCache.get(ip);
  if (cached && cached.expires > Date.now()) return cached.country;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=countryCode`,
      { signal: controller.signal },
    );
    clearTimeout(timer);
    const data = await res.json();
    const country =
      data?.countryCode === "ID" ? "ID" : data?.countryCode === "KR" ? "KR" : "KR";
    geoCache.set(ip, { country, expires: Date.now() + GEO_CACHE_MS });
    return country;
  } catch {
    return "KR";
  }
}

export async function resolveVisitorCountry(req) {
  const sync = resolveCountrySync(req);
  if (sync) return sync;
  return countryFromIpLookup(getClientIp(req));
}

export async function resolveVisitorTimezone(req) {
  const country = await resolveVisitorCountry(req);
  return { country, timezone: timezoneForCountry(country) };
}

const LOCAL_API = "http://localhost:3601";
const PROD_SITE = "https://dayeon-shop.web.app";

/** 클라이언트: 빈 값 → same-origin /api. SSR: API_SERVER_URL 또는 프로덕션 사이트 */
export function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) return env;
  if (typeof window !== "undefined") return "";
  const server = process.env.API_SERVER_URL?.trim();
  if (server) return server;
  return process.env.NODE_ENV === "production" ? PROD_SITE : LOCAL_API;
}

/** API 연결 안내 문구용 URL */
export function getApiDisplayUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) return env;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  const server = process.env.API_SERVER_URL?.trim();
  if (server) return `${server.replace(/\/$/, "")}/api`;
  return process.env.NODE_ENV === "production"
    ? `${PROD_SITE}/api`
    : `${LOCAL_API}/api`;
}

const API = getApiBase();

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || res.statusText) as Error & {
      code?: string;
      stock?: unknown;
    };
    err.code = data.code;
    err.stock = data.stock;
    throw err;
  }
  return data as T;
}

export function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

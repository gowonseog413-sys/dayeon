import { updateDb } from "./db.js";

/** 로그인 성공 시 최근 접속·접속 횟수 갱신 */
export function recordUserLogin(userId) {
  if (!userId) return;
  const now = new Date().toISOString();
  updateDb((d) => {
    const u = d.users.find((x) => x.id === userId);
    if (!u) return;
    u.lastLoginAt = now;
    u.loginCount = (u.loginCount || 0) + 1;
  });
}

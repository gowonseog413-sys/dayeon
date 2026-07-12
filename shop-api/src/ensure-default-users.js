import bcrypt from "bcryptjs";
import { updateDb } from "./db.js";
import { ALL_PERMISSION_IDS, ensureMasterPermissions } from "./erp-permissions.js";
import { ensureMemberSettings, referralCodeForUser } from "./member-settings.js";

/** ERP·데모 테스트 계정 — 프로덕션 DB에 없거나 비밀번호가 없으면 복구 */
const DEFAULT_ACCOUNTS = [
  {
    id: "u-master",
    email: "dayeon@naver.com",
    password: "admin1004",
    firstName: "다연",
    lastName: "Admin",
    phone: "010-0000-0001",
    address: "서울특별시 강남구 테헤란로 1",
    role: "admin",
    points: 0,
  },
];

export async function ensureDefaultUsers() {
  const hashes = Object.fromEntries(
    await Promise.all(
      DEFAULT_ACCOUNTS.map(async (a) => [a.email, await bcrypt.hash(a.password, 10)]),
    ),
  );

  updateDb((db) => {
    ensureMemberSettings(db);
    if (!Array.isArray(db.users)) db.users = [];

    for (const def of DEFAULT_ACCOUNTS) {
      let user = db.users.find((u) => u.email?.toLowerCase() === def.email);
      if (!user) {
        const created = {
          id: def.id,
          email: def.email,
          passwordHash: hashes[def.email],
          authProvider: "local",
          googleId: null,
          avatarUrl: null,
          firstName: def.firstName,
          lastName: def.lastName,
          phone: def.phone,
          address: def.address,
          role: def.role,
          adminRole: def.role === "admin" ? "master" : undefined,
          erpPermissions: def.role === "admin" ? [...ALL_PERMISSION_IDS] : undefined,
          points: def.points,
          loginCount: 0,
          createdAt: new Date().toISOString(),
        };
        created.referralCode = referralCodeForUser(created);
        db.users.push(created);
        continue;
      }

      if (!user.passwordHash || user.authProvider === "google") {
        user.passwordHash = hashes[def.email];
        user.authProvider = "local";
      }
      if (def.role === "admin" && user.role !== "admin") {
        user.role = "admin";
      }
      if (!user.referralCode) {
        user.referralCode = referralCodeForUser(user);
      }
    }
    ensureMasterPermissions(db);
  });
}

import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { referralCodeForUser } from "../member-settings.js";

export function findOrCreateGoogleUser(profile) {
  const email = profile.email?.toLowerCase();
  if (!email) throw new Error("Google 계정에서 이메일을 가져올 수 없습니다.");

  const db = readDb();
  let user =
    db.users.find((u) => u.googleId === profile.sub) ||
    db.users.find((u) => u.email === email);

  if (user) {
    if (!user.googleId) {
      updateDb((d) => {
        const u = d.users.find((x) => x.id === user.id);
        if (u) {
          u.googleId = profile.sub;
          u.authProvider = u.authProvider === "local" ? "google" : u.authProvider;
          if (profile.picture) u.avatarUrl = profile.picture;
        }
      });
      user = readDb().users.find((u) => u.id === user.id);
    }
    return user;
  }

  const newUser = {
    id: uuid(),
    email,
    googleId: profile.sub,
    authProvider: "google",
    passwordHash: null,
    firstName: profile.given_name || profile.name?.split(" ")[0] || "User",
    lastName: profile.family_name || "",
    avatarUrl: profile.picture || null,
    role: "customer",
    points: 0,
    loginCount: 0,
    createdAt: new Date().toISOString(),
  };
  newUser.referralCode = referralCodeForUser(newUser);

  updateDb((d) => {
    d.users.push(newUser);
  });

  return newUser;
}

export function isProfileComplete(user) {
  if (!user || user.role === "admin") return true;
  return Boolean(
    String(user.firstName || "").trim() &&
      String(user.phone || "").trim() &&
      String(user.birthDate || "").trim(),
  );
}

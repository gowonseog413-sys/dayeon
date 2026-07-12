export function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

export function normalizePersonName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function userDisplayName(user) {
  return normalizePersonName(`${user.firstName || ""} ${user.lastName || ""}`);
}

export function phonesMatch(user, inputPhone) {
  const a = normalizePhone(user.phone);
  const b = normalizePhone(inputPhone);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10)) return true;
  return false;
}

export function namesMatch(user, inputName) {
  const given = normalizePersonName(inputName);
  if (!given) return false;
  const full = userDisplayName(user);
  const first = normalizePersonName(user.firstName || "");
  return given === full || given === first;
}

export function normalizeBirthDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return raw;
}

export function birthDatesMatch(user, inputBirthDate) {
  const stored = normalizeBirthDate(user.birthDate);
  const given = normalizeBirthDate(inputBirthDate);
  if (!stored || !given) return false;
  return stored === given;
}

export function canResetPassword(user) {
  if (!user) return { ok: false, error: "등록되지 않은 이메일입니다." };
  if (!user.passwordHash) {
    return { ok: false, error: "이 계정은 Google 로그인을 사용합니다. Google로 로그인해 주세요." };
  }
  if (user.role === "admin") {
    return {
      ok: false,
      error: "관리자 계정은 푸터의 「관리자페이지」에서 ERP 관리자에게 문의해 주세요.",
    };
  }
  if (!user.phone) {
    return {
      ok: false,
      error: "가입 시 등록한 휴대폰 번호가 없습니다. 고객센터로 문의해 주세요.",
    };
  }
  return { ok: true };
}

export function parseRegistrationName(body) {
  const rawName = normalizePersonName(body.name || "");
  if (rawName) {
    const space = rawName.indexOf(" ");
    if (space === -1) {
      return { firstName: rawName, lastName: "" };
    }
    return {
      firstName: rawName.slice(0, space),
      lastName: rawName.slice(space + 1).trim(),
    };
  }
  const firstName = normalizePersonName(body.firstName || "");
  const lastName = normalizePersonName(body.lastName || "");
  return { firstName, lastName };
}

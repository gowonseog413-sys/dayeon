"use client";

import type { User } from "./types";

const SHOP_TOKEN_KEY = "eyesight_token";
const SHOP_USER_KEY = "eyesight_user";
const ERP_TOKEN_KEY = "dayeon_erp_token";
const ERP_USER_KEY = "dayeon_erp_user";
const ERP_PORTAL_KEY = "dayeon_erp_portal";

export const AUTH_UPDATED_EVENT = "auth-updated";
export const ERP_AUTH_UPDATED_EVENT = "erp-auth-updated";

/** 관리자 대문(/admin-gate) 경유 ERP 접속 여부 */
export function hasErpPortalAccess() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ERP_PORTAL_KEY) === "1";
}

function grantErpPortalAccess() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ERP_PORTAL_KEY, "1");
}

function revokeErpPortalAccess() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ERP_PORTAL_KEY);
}

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as User;
    if (!user?.id || !user?.email) return null;
    return user;
  } catch {
    return null;
  }
}

/** 쇼핑몰 로그인 토큰 */
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SHOP_TOKEN_KEY);
}

/** 쇼핑몰 로그인 사용자 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  return parseStoredUser(localStorage.getItem(SHOP_USER_KEY));
}

/** ERP 관리자 세션 토큰 (쇼핑몰과 별도) */
export function getErpToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ERP_TOKEN_KEY);
}

/** ERP 관리자 세션 사용자 */
export function getErpStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  return parseStoredUser(sessionStorage.getItem(ERP_USER_KEY));
}

/** 쇼핑몰 로그인 저장 — ERP 세션과 무관 */
export function saveSession(
  token: string,
  user: User,
  options?: { silent?: boolean },
) {
  localStorage.setItem(SHOP_TOKEN_KEY, token);
  localStorage.setItem(SHOP_USER_KEY, JSON.stringify(user));
  if (!options?.silent) window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

/** ERP 관리자 대문 로그인 저장 — 쇼핑몰 세션에 영향 없음 */
export function saveErpSession(
  token: string,
  user: User,
  options?: { silent?: boolean },
) {
  sessionStorage.setItem(ERP_TOKEN_KEY, token);
  sessionStorage.setItem(ERP_USER_KEY, JSON.stringify(user));
  grantErpPortalAccess();
  if (!options?.silent) window.dispatchEvent(new Event(ERP_AUTH_UPDATED_EVENT));
}

/** 쇼핑몰 로그아웃 — ERP 세션 유지 */
export function clearSession() {
  localStorage.removeItem(SHOP_TOKEN_KEY);
  localStorage.removeItem(SHOP_USER_KEY);
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

/** ERP 로그아웃 — 쇼핑몰 세션 유지 */
export function clearErpSession() {
  sessionStorage.removeItem(ERP_TOKEN_KEY);
  sessionStorage.removeItem(ERP_USER_KEY);
  revokeErpPortalAccess();
  window.dispatchEvent(new Event(ERP_AUTH_UPDATED_EVENT));
}

/** 예전 ERP 로그인이 쇼핑몰 localStorage에 남아 있으면 ERP 세션으로 이전 */
export function migrateLegacyErpShopSession() {
  if (typeof window === "undefined") return;
  if (getErpToken()) return;
  if (!hasErpPortalAccess()) return;
  const shopToken = localStorage.getItem(SHOP_TOKEN_KEY);
  const shopUser = parseStoredUser(localStorage.getItem(SHOP_USER_KEY));
  if (shopToken && shopUser?.role === "admin") {
    saveErpSession(shopToken, shopUser, { silent: true });
    clearSession();
  }
}

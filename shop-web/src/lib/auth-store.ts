"use client";

import type { User } from "./types";

const TOKEN_KEY = "eyesight_token";
const USER_KEY = "eyesight_user";
export const AUTH_UPDATED_EVENT = "auth-updated";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as User;
    if (!user?.id || !user?.email) return null;
    return user;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: User, silent = false) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (!silent) window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

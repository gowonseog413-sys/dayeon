"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AUTH_UPDATED_EVENT,
  clearSession,
  getStoredUser,
  getToken,
  migrateLegacyErpShopSession,
  saveSession,
} from "@/lib/auth-store";
import { clearCart } from "@/lib/cart-store";
import type { User } from "@/lib/types";

function readCachedUser(): User | null {
  const token = getToken();
  const cached = getStoredUser();
  return token && cached ? cached : null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    migrateLegacyErpShopSession();
    const token = getToken();
    const cached = getStoredUser();
    if (!token || !cached) {
      clearCart();
      setUser(null);
      setReady(true);
      return;
    }
    setUser(cached);
    try {
      const data = await api<{ user: User }>("/api/auth/me", { token });
      saveSession(token, data.user, { silent: true });
      setUser(data.user);
    } catch {
      clearSession();
      clearCart();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const cached = readCachedUser();
    if (cached) setUser(cached);

    refresh();
    const onAuth = () => refresh();
    window.addEventListener(AUTH_UPDATED_EVENT, onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [refresh]);

  return { user, ready, refresh };
}

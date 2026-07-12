"use client";

import { api } from "./api";
import { getToken } from "./auth-store";
import type { CartItem } from "./types";

const CART_KEY = "eyesight_cart";

function newCartId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeItem(raw: Partial<CartItem>): CartItem | null {
  const productId = String(raw.productId || "").trim();
  const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 0));
  if (!productId) return null;
  return {
    id: raw.id || newCartId(),
    productId,
    quantity,
    savedAt: raw.savedAt || new Date().toISOString(),
  };
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  if (!getToken()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as Partial<CartItem>[];
    return parsed
      .map(normalizeItem)
      .filter((item): item is CartItem => item !== null)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

function mergeCartItems(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...a, ...b].map((x) => normalizeItem(x)).filter(Boolean) as CartItem[]) {
    map.set(item.id, item);
  }
  return [...map.values()].sort((x, y) => y.savedAt.localeCompare(x.savedAt));
}

async function syncCartToServer(items: CartItem[]) {
  const token = getToken();
  if (!token) return;
  try {
    await api<{ items: CartItem[] }>("/api/cart", {
      method: "PUT",
      token,
      body: JSON.stringify({ items }),
    });
  } catch {
    /* 오프라인·세션 만료 시 로컬만 유지 */
  }
}

export function saveCart(items: CartItem[], options?: { skipSync?: boolean }) {
  const normalized = items
    .map(normalizeItem)
    .filter((item): item is CartItem => item !== null)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  localStorage.setItem(CART_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("cart-updated"));
  if (!options?.skipSync) void syncCartToServer(normalized);
}

export function addToCart(productId: string, qty = 1) {
  if (!getToken()) return false;
  const cart = getCart();
  cart.unshift({
    id: newCartId(),
    productId,
    quantity: Math.max(1, qty),
    savedAt: new Date().toISOString(),
  });
  saveCart(cart);
  return true;
}

export function removeFromCart(entryId: string) {
  saveCart(getCart().filter((c) => c.id !== entryId));
}

/** 장바구니에 담긴 상품 종류 수 (수량 합이 아님) */
export function cartCount() {
  return getCart().length;
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

/** 로그인 후 로컬·서버 장바구니 병합 */
export async function mergeCartOnLogin(token: string) {
  const local = getCart();
  try {
    const remote = await api<{ items: CartItem[] }>("/api/cart", { token });
    const merged = mergeCartItems(local, remote.items || []);
    await api<{ items: CartItem[] }>("/api/cart", {
      method: "PUT",
      token,
      body: JSON.stringify({ items: merged }),
    });
    saveCart(merged, { skipSync: true });
  } catch {
    if (local.length) await syncCartToServer(local);
  }
}

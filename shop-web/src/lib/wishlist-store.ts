"use client";

import { api } from "./api";
import { getToken } from "./auth-store";
import type { WishlistItem } from "./types";

export const WISHLIST_UPDATED_EVENT = "wishlist-updated";

const WISHLIST_KEY = "eyesight_wishlist";

function newWishlistId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeItem(raw: Partial<WishlistItem>): WishlistItem | null {
  const productId = String(raw.productId || "").trim();
  if (!productId) return null;
  return {
    id: raw.id || newWishlistId(),
    productId,
    savedAt: raw.savedAt || new Date().toISOString(),
  };
}

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]") as Partial<WishlistItem>[];
    const map = new Map<string, WishlistItem>();
    for (const item of parsed.map(normalizeItem).filter(Boolean) as WishlistItem[]) {
      map.set(item.productId, item);
    }
    return [...map.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

function mergeWishlistItems(a: WishlistItem[], b: WishlistItem[]): WishlistItem[] {
  const map = new Map<string, WishlistItem>();
  for (const item of [...a, ...b].map(normalizeItem).filter(Boolean) as WishlistItem[]) {
    const prev = map.get(item.productId);
    if (!prev || item.savedAt > prev.savedAt) map.set(item.productId, item);
  }
  return [...map.values()].sort((x, y) => y.savedAt.localeCompare(x.savedAt));
}

async function syncWishlistToServer(items: WishlistItem[]) {
  const token = getToken();
  if (!token) return;
  try {
    await api<{ items: WishlistItem[] }>("/api/wishlist", {
      method: "PUT",
      token,
      body: JSON.stringify({ items }),
    });
  } catch {
    /* 로컬만 유지 */
  }
}

export function saveWishlist(items: WishlistItem[], options?: { skipSync?: boolean }) {
  const normalized = mergeWishlistItems(items, []);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
  if (!options?.skipSync) void syncWishlistToServer(normalized);
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().some((w) => w.productId === productId);
}

export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const exists = list.some((w) => w.productId === productId);
  const next = exists
    ? list.filter((w) => w.productId !== productId)
    : [
        { id: newWishlistId(), productId, savedAt: new Date().toISOString() },
        ...list,
      ];
  saveWishlist(next);
  return !exists;
}

export function removeFromWishlist(productId: string) {
  saveWishlist(getWishlist().filter((w) => w.productId !== productId));
}

export function wishlistCount() {
  return getWishlist().length;
}

export async function mergeWishlistOnLogin(token: string) {
  const local = getWishlist();
  try {
    const remote = await api<{ items: WishlistItem[] }>("/api/wishlist", { token });
    const merged = mergeWishlistItems(local, remote.items || []);
    await api<{ items: WishlistItem[] }>("/api/wishlist", {
      method: "PUT",
      token,
      body: JSON.stringify({ items: merged }),
    });
    saveWishlist(merged, { skipSync: true });
  } catch {
    if (local.length) await syncWishlistToServer(local);
  }
}

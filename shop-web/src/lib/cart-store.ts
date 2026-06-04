"use client";

import type { CartItem } from "./types";

const CART_KEY = "eyesight_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(productId: string, qty = 1) {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === productId);
  if (existing) existing.quantity += qty;
  else cart.push({ productId, quantity: qty });
  saveCart(cart);
}

export function cartCount() {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}

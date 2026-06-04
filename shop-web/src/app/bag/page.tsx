"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { getCart } from "@/lib/cart-store";
import type { CartItem, Product } from "@/lib/types";

export default function BagPage() {
  const [lines, setLines] = useState<(CartItem & { product: Product })[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const cart = getCart();
      if (!cart.length) return setLines([]);
      try {
        const { products } = await api<{ products: Product[] }>("/api/products");
        setLines(
          cart
            .map((c) => {
              const product = products.find((p) => p.id === c.productId);
              return product ? { ...c, product } : null;
            })
            .filter(Boolean) as (CartItem & { product: Product })[],
        );
      } catch {
        setMsg("상품 정보를 불러오지 못했습니다. API 서버를 확인하세요.");
      }
    }
    load();
  }, []);

  const total = lines.reduce((s, l) => s + l.product.priceSale * l.quantity, 0);

  function goCheckout() {
    const token = getToken();
    if (!token) {
      window.location.href = "/login?next=/checkout";
      return;
    }
    window.location.href = "/checkout";
  }

  if (!lines.length) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-medium">My Bag</h1>
        <p className="mt-4 text-gray-500">장바구니가 비어 있습니다.</p>
        <Link href="/" className="mt-6 inline-block text-[var(--pink-accent)]">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-xl font-medium">My Bag ({lines.length})</h1>
      <ul className="space-y-4">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 border-b border-gray-100 pb-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-50">
              <Image src={l.product.image} alt={l.product.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{l.product.brand}</p>
              <p className="font-medium">{l.product.name}</p>
              <p className="text-[var(--pink-accent)]">{formatRp(l.product.priceSale)} × {l.quantity}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-right text-lg font-semibold">합계 {formatRp(total)}</p>
      {msg && <p className="mt-2 text-center text-sm text-gray-600">{msg}</p>}
      <button
        type="button"
        onClick={goCheckout}
        className="mt-6 w-full rounded-full bg-[var(--pink-accent)] py-3 text-white"
      >
        결제하기
      </button>
    </div>
  );
}

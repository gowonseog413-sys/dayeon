"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRp } from "@/lib/api";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  variant?: "compact" | "tall";
};

export function ProductCard({ product, variant = "compact" }: Props) {
  const tall = variant === "tall";

  return (
    <article className="group relative flex flex-col">
      {product.badge && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--pink-accent)] px-2 py-0.5 text-[10px] font-bold text-white">
          {product.badge}
        </span>
      )}
      <Link
        href={`/product/${product.id}`}
        className={`relative block overflow-hidden rounded-md bg-gray-50 ${tall ? "aspect-[3/4]" : "aspect-square"}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition group-hover:scale-105"
        />
        {tall && (
          <span
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full border-2 border-white shadow"
            style={{ background: product.colorSwatch }}
          />
        )}
      </Link>
      <div className="mt-2 space-y-0.5 text-center text-sm">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <Link href={`/product/${product.id}`} className="font-medium hover:text-[var(--pink-accent)]">
          {product.name}
        </Link>
        <p className="text-xs text-gray-400 line-through">{formatRp(product.priceOriginal)}</p>
        <p className="font-semibold text-[var(--pink-accent)]">{formatRp(product.priceSale)}</p>
        {!tall && (
          <span
            className="mx-auto mt-1 inline-block h-4 w-4 rounded-full border border-gray-200"
            style={{ background: product.colorSwatch }}
          />
        )}
        <button
          type="button"
          onClick={() => {
            addToCart(product.id);
            alert("장바구니에 담았습니다.");
          }}
          className="mt-2 w-full rounded-full border border-[var(--pink-accent)] py-1 text-xs text-[var(--pink-accent)] opacity-0 transition group-hover:opacity-100"
        >
          담기
        </button>
      </div>
    </article>
  );
}

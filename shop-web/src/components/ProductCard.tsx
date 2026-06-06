"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatRp } from "@/lib/api";
import { getProductDisplayBadge } from "@/lib/erp-products";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  variant?: "compact" | "tall";
};

export function ProductCard({ product, variant = "compact" }: Props) {
  const tall = variant === "tall";
  const fallback = productImageFallback(product);
  const [imgSrc, setImgSrc] = useState(product.image);
  const badge = getProductDisplayBadge(product);

  return (
    <article className="product-card-cute group relative flex h-full flex-col">
      {badge && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--pink-accent)] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
          {badge}
        </span>
      )}
      <Link
        href={`/product/${product.id}`}
        className={`product-image-frame relative block ${tall ? "aspect-[3/4]" : "aspect-square"}`}
      >
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          onError={() => setImgSrc(fallback)}
        />
        {tall && (
          <span
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full border-2 border-white shadow-md ring-2 ring-[var(--pink-border)]"
            style={{ background: product.colorSwatch }}
          />
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col items-center space-y-0.5 px-1 pb-1 text-center text-sm">
        <p className="product-card-brand text-xs font-medium text-[var(--pink-deep)]/70">{product.brand}</p>
        <Link
          href={`/product/${product.id}`}
          className="product-card-name font-semibold text-gray-800 transition hover:text-[var(--pink-accent)]"
        >
          {product.name}
        </Link>
        {product.priceOriginal > product.priceSale ? (
          <p className="product-card-price-original text-xs text-gray-400 line-through">
            {formatRp(product.priceOriginal)}
          </p>
        ) : null}
        <p className="product-card-price-sale text-base font-bold text-[var(--pink-accent)]">
          {formatRp(product.priceSale)}
        </p>
        {!tall && (
          <span
            className="mx-auto mt-1.5 inline-block h-5 w-5 rounded-full border-2 border-white shadow ring-1 ring-[var(--pink-border)]"
            style={{ background: product.colorSwatch }}
          />
        )}
      </div>
    </article>
  );
}

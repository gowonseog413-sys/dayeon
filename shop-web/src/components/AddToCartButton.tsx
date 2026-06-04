"use client";

import { addToCart } from "@/lib/cart-store";

type Props = {
  productId: string;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  productId,
  className = "",
  label = "장바구니에 담기",
}: Props) {
  return (
    <button
      type="button"
      className={`rounded-full bg-[var(--pink-accent)] px-6 py-3 text-sm font-medium text-white ${className}`}
      onClick={() => {
        addToCart(productId);
        alert("장바구니에 담았습니다.");
      }}
    >
      {label}
    </button>
  );
}

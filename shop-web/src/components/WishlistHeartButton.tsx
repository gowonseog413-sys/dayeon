"use client";

import { useEffect, useState } from "react";
import {
  isInWishlist,
  toggleWishlist,
  WISHLIST_UPDATED_EVENT,
} from "@/lib/wishlist-store";

type Props = {
  productId: string;
  size?: "md" | "lg";
  showLabel?: boolean;
  label?: string;
  onToggle?: (added: boolean) => void;
};

export function WishlistHeartButton({
  productId,
  size = "lg",
  showLabel = false,
  label,
  onToggle,
}: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isInWishlist(productId));
    const refresh = () => setActive(isInWishlist(productId));
    window.addEventListener(WISHLIST_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, refresh);
  }, [productId]);

  const dim = size === "lg" ? "h-11 w-11 text-xl" : "h-9 w-9 text-base";

  return (
    <button
      type="button"
      onClick={() => {
        const added = toggleWishlist(productId);
        setActive(added);
        onToggle?.(added);
      }}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border-2 transition ${
        active
          ? "border-[var(--pink-accent)] bg-[var(--pink-bg-soft)] text-[var(--pink-accent)]"
          : "border-[var(--pink-border)] bg-white text-gray-400 hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)]"
      } ${showLabel ? "px-4 py-2" : dim}`}
      aria-pressed={active}
      aria-label={active ? "위시리스트에서 제거" : "위시리스트에 저장"}
      title={active ? "위시리스트에 저장됨" : "나중에 살 상품으로 저장"}
    >
      <span className={active ? "scale-110" : ""} aria-hidden>
        {active ? "♥" : "♡"}
      </span>
      {showLabel && label ? (
        <span className="text-sm font-medium">{label}</span>
      ) : null}
    </button>
  );
}

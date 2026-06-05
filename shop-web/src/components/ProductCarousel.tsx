"use client";

import { useRef, useState } from "react";
import { CuteSectionTitle } from "@/components/CuteSectionTitle";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  title: string;
  products: Product[];
  variant?: "compact" | "tall";
  pinkBg?: boolean;
  visibleCount?: number;
};

export function ProductCarousel({
  title,
  products,
  variant = "compact",
  pinkBg = false,
  visibleCount = 3,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, products.length - visibleCount);

  function scrollTo(i: number) {
    const next = Math.max(0, Math.min(maxIndex, i));
    setIndex(next);
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const gap = 16;
    const step = (card?.offsetWidth ?? 220) + gap;
    el.scrollTo({ left: next * step, behavior: "smooth" });
  }

  if (!products.length) return null;

  const cardWidth =
    variant === "tall"
      ? "min-w-[calc(50%-0.5rem)] sm:min-w-[calc(33.333%-0.75rem)] md:min-w-[calc(20%-0.8rem)]"
      : "min-w-[calc(50%-0.5rem)] sm:min-w-[calc(33.333%-0.75rem)] md:min-w-[calc(25%-0.75rem)]";

  return (
    <section
      className={`py-10 ${pinkBg ? "bg-[var(--pink-bg)]/60" : "bg-white/40"}`}
    >
      <CuteSectionTitle title={title} />
      <div className="relative mx-auto max-w-6xl px-4">
        {products.length > visibleCount && (
          <>
            <button
              type="button"
              aria-label="이전 상품"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              className="absolute -left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--pink-border)] bg-white text-lg text-[var(--pink-accent)] shadow-sm transition hover:border-[var(--pink-accent)] hover:bg-[var(--pink-bg)] disabled:opacity-30 md:left-0"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 상품"
              onClick={() => scrollTo(index + 1)}
              disabled={index >= maxIndex}
              className="absolute -right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--pink-border)] bg-white text-lg text-[var(--pink-accent)] shadow-sm transition hover:border-[var(--pink-accent)] hover:bg-[var(--pink-bg)] disabled:opacity-30 md:right-0"
            >
              ›
            </button>
          </>
        )}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <div key={p.id} data-carousel-card className={`shrink-0 ${cardWidth}`}>
              <ProductCard product={p} variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

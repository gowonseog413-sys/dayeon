"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const SLIDES = [
  { src: "/banners/banner-summer-sale.png", alt: "Summer Sale" },
  { src: "/banners/banner-store-opening.png", alt: "Store Opening Promo" },
  { src: "/banners/banner-premium-lenses.png", alt: "Premium Lenses" },
  { src: "/banners/banner-bloominc-collection.png", alt: "Bloominc Collection" },
  { src: "/banners/banner-new-arrival.png", alt: "New Arrival" },
];

export function HeroCarousel() {
  const { theme } = useTheme();
  /** 깔끔테마: 스토어 오픈 고정 / 인도네시아: 신규 도착 고정 */
  const slides = useMemo(() => {
    if (theme === "clean") return [SLIDES[1]];
    if (theme === "indonesia") return [SLIDES[4]];
    return SLIDES;
  }, [theme]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [theme]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const showControls = slides.length > 1;

  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-2">
      <div className="hero-carousel-frame relative aspect-[21/7] w-full overflow-hidden rounded-3xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] shadow-[0_8px_32px_var(--pink-shadow)]">
        <Image
          src={slides[idx].src}
          alt={slides[idx].alt}
          fill
          className="object-cover"
          priority
        />
        {showControls && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 shadow"
              onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 shadow"
              onClick={() => setIdx((i) => (i + 1) % slides.length)}
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`h-2 w-2 rounded-full ${i === idx ? "bg-[var(--pink-accent)]" : "bg-white/70"}`}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

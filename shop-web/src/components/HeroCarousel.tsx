"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useHeroBanners } from "@/components/HeroBannerProvider";
import { heroSlideTarget } from "@/lib/hero-banners";

function SlideImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      priority={priority}
      unoptimized
    />
  );
}

export function HeroCarousel() {
  const { heroBanners } = useHeroBanners();
  const slides = heroBanners.filter((s) => s.image.trim());
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [heroBanners]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;

  const showControls = slides.length > 1;
  const current = slides[idx];
  const target = heroSlideTarget(current);

  const imageNode = (
    <SlideImage src={current.image} alt={current.alt || "Hero banner"} priority={idx === 0} />
  );

  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-2">
      <div className="hero-carousel-frame relative aspect-[21/7] w-full overflow-hidden rounded-3xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] shadow-[0_8px_32px_var(--pink-shadow)]">
        {target ? (
          target.kind === "product" ? (
            <Link href={target.href} className="relative block h-full w-full">
              {imageNode}
            </Link>
          ) : target.newTab ? (
            <a
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-full w-full"
            >
              {imageNode}
            </a>
          ) : (
            <a href={target.href} className="relative block h-full w-full">
              {imageNode}
            </a>
          )
        ) : (
          <div className="relative h-full w-full">{imageNode}</div>
        )}
        {showControls && (
          <>
            <button
              type="button"
              aria-label="이전 배너"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/60 bg-white/90 px-3 py-2 text-lg shadow-md transition hover:bg-white"
              onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 배너"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/60 bg-white/90 px-3 py-2 text-lg shadow-md transition hover:bg-white"
              onClick={() => setIdx((i) => (i + 1) % slides.length)}
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
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

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/placeholders/hero-summer.svg", alt: "Summer Sale" },
  { src: "/placeholders/hero-lenses.svg", alt: "Premium Lenses" },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-lg px-4">
      <div className="relative aspect-[21/7] w-full bg-gray-100">
        <Image
          src={SLIDES[idx].src}
          alt={SLIDES[idx].alt}
          fill
          className="object-cover"
          priority
        />
        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 shadow"
          onClick={() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        >
          ‹
        </button>
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 shadow"
          onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}
        >
          ›
        </button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-2 w-2 rounded-full ${i === idx ? "bg-[var(--pink-accent)]" : "bg-white/70"}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

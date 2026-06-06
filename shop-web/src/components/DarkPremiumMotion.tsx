"use client";

import { useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { useMouseScopeTrail } from "@/lib/use-mouse-scope-trail";

type StarItem = {
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
};

type FallingStar = {
  id: number;
  x: number;
  y: number;
  kind: "dot" | "glow" | "spark";
  size: number;
  drift: number;
  duration: number;
};

const ROW_BANDS = 3;
const COL_BANDS = 4;
const STAR_COUNT = 60;

const CONSTELLATION_POINTS = [
  { x: 12, y: 62 },
  { x: 20, y: 52 },
  { x: 28, y: 48 },
  { x: 36, y: 54 },
  { x: 44, y: 50 },
  { x: 52, y: 42 },
  { x: 60, y: 34 },
  { x: 72, y: 22 },
] as const;

const CONSTELLATION_LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [2, 4],
];

function clampPct(value: number) {
  return Math.min(95, Math.max(4, value));
}

function buildBalancedStars(count: number, seed = 1): StarItem[] {
  const cells = ROW_BANDS * COL_BANDS;
  const base = Math.floor(count / cells);
  const extra = count % cells;
  const items: StarItem[] = [];
  let idx = 0;

  for (let row = 0; row < ROW_BANDS; row += 1) {
    for (let col = 0; col < COL_BANDS; col += 1) {
      const cellIndex = row * COL_BANDS + col;
      const cellCount = base + (cellIndex < extra ? 1 : 0);
      const topMin = (row / ROW_BANDS) * 100;
      const topSpan = 100 / ROW_BANDS;
      const leftMin = (col / COL_BANDS) * 100;
      const leftSpan = 100 / COL_BANDS;

      for (let j = 0; j < cellCount; j += 1) {
        const i = idx;
        idx += 1;
        const jx = (((i + 1) * seed * 17) % 16) - 8;
        const jy = (((i + 1) * seed * 13) % 14) - 7;
        const slot = (j + 0.5) / Math.max(cellCount, 1);

        items.push({
          left: `${clampPct(leftMin + leftSpan * slot + jx * 0.2)}%`,
          top: `${clampPct(topMin + topSpan * (0.4 + (j % 2) * 0.25) + jy * 0.18)}%`,
          delay: (i * 0.18) % 4,
          duration: 2.2 + (i % 4) * 0.55,
          size: 1 + (i % 3) * 0.5,
        });
      }
    }
  }

  return items;
}

const STAR_KINDS: FallingStar["kind"][] = ["dot", "dot", "glow", "spark"];

export function DarkPremiumMotion() {
  const stars = useMemo(() => buildBalancedStars(STAR_COUNT, 11), []);
  const northStar = CONSTELLATION_POINTS[7];

  const spawn = useCallback((relX: number, relY: number, seed: number): Omit<FallingStar, "id">[] => {
    const count = 2 + (seed % 3);
    const batch: Omit<FallingStar, "id">[] = [];

    for (let i = 0; i < count; i += 1) {
      const n = seed + i * 7;
      batch.push({
        x: relX + ((n % 17) - 8) * 2.2,
        y: relY + ((n % 13) - 6) * 2,
        kind: STAR_KINDS[(n + i) % STAR_KINDS.length],
        size: 0.7 + (n % 5) * 0.22,
        drift: ((n % 21) - 10) * 1.8,
        duration: 1.15 + (n % 4) * 0.28,
      });
    }

    return batch;
  }, []);

  const { particles, removeParticle } = useMouseScopeTrail<FallingStar>(spawn, {
    throttleMs: 65,
    maxKeep: 48,
  });

  return (
    <div
      className="theme-motion theme-motion--dark theme-motion--north-star theme-motion--page"
      aria-hidden
    >
      <svg
        className="theme-motion-constellation"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {CONSTELLATION_LINES.map(([a, b], i) => {
          const p1 = CONSTELLATION_POINTS[a];
          const p2 = CONSTELLATION_POINTS[b];
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="theme-motion-constellation-line"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          );
        })}
        {CONSTELLATION_POINTS.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 7 ? 1.8 : 1.1}
            className={`theme-motion-constellation-star${i === 7 ? " theme-motion-constellation-star--bright" : ""}`}
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </svg>

      {stars.map((star, index) => (
        <span
          key={index}
          className="theme-motion-starfield-dot"
          style={
            {
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            } as CSSProperties
          }
        />
      ))}

      <div
        className="theme-motion-north-star"
        style={{ left: `${northStar.x}%`, top: `${northStar.y}%` }}
      >
        <span className="theme-motion-north-star-glow" />
        <span className="theme-motion-north-star-core" />
        <span className="theme-motion-north-star-flare theme-motion-north-star-flare--h" />
        <span className="theme-motion-north-star-flare theme-motion-north-star-flare--v" />
      </div>

      <div className="dark-falling-star-trail">
        {particles.map((s) => (
          <span
            key={s.id}
            className={`dark-falling-star dark-falling-star--${s.kind}`}
            style={
              {
                left: s.x,
                top: s.y,
                "--star-size": s.size,
                "--star-drift": `${s.drift}px`,
                "--fall-duration": `${s.duration}s`,
              } as CSSProperties
            }
            onAnimationEnd={() => removeParticle(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

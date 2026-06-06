"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type SeaCreature = {
  left: string;
  top: string;
  emoji: string;
  kind: "fish" | "jelly" | "shell" | "crab" | "blowfish";
  delay: number;
  duration: number;
  scale: number;
  flip: boolean;
};

type VaporParticle = {
  id: number;
  x: number;
  y: number;
  kind: "drop" | "mist";
  size: number;
};

const ROW_BANDS = 3;
const COL_BANDS = 4;

const CREATURE_POOL: SeaCreature["kind"][] = [
  "fish",
  "fish",
  "jelly",
  "jelly",
  "shell",
  "shell",
  "crab",
  "blowfish",
];

const CREATURE_EMOJI: Record<SeaCreature["kind"], string> = {
  fish: "🐠",
  jelly: "🪼",
  shell: "🐚",
  crab: "🦀",
  blowfish: "🐡",
};

function clampPct(value: number) {
  return Math.min(95, Math.max(4, value));
}

function buildSeaCreatures(count: number): SeaCreature[] {
  const cells = ROW_BANDS * COL_BANDS;
  const base = Math.floor(count / cells);
  const extra = count % cells;
  const items: SeaCreature[] = [];
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
        const kind = CREATURE_POOL[i % CREATURE_POOL.length];
        const jx = (((i + 1) * 17) % 16) - 8;
        const jy = (((i + 1) * 11) % 14) - 7;
        const slot = (j + 0.5) / Math.max(cellCount, 1);

        items.push({
          left: `${clampPct(leftMin + leftSpan * slot + jx * 0.22)}%`,
          top: `${clampPct(topMin + topSpan * (0.38 + (j % 2) * 0.22) + jy * 0.18)}%`,
          emoji: CREATURE_EMOJI[kind],
          kind,
          delay: (i * 0.35) % 3,
          duration: 6.5 + (i % 5) * 1.5 + (kind === "shell" ? 2 : 0),
          scale: 0.75 + (i % 3) * 0.18,
          flip: i % 2 === 0,
        });
      }
    }
  }

  return items;
}

const BUBBLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${12 + ((i * 29) % 76)}%`,
  top: `${8 + ((i * 37) % 84)}%`,
  delay: (i * 0.35) % 2.5,
  duration: 2.8 + (i % 4) * 0.65,
  scale: 0.5 + (i % 3) * 0.2,
}));

export function AquaSeaMotion() {
  const creatures = useMemo(() => buildSeaCreatures(18), []);
  const [vapors, setVapors] = useState<VaporParticle[]>([]);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const scopeRef = useRef<HTMLElement | null>(null);

  const removeVapor = useCallback((id: number) => {
    setVapors((prev) => prev.filter((v) => v.id !== id));
  }, []);

  useEffect(() => {
    scopeRef.current = document.querySelector(".site-motion-scope");

    const onMove = (e: MouseEvent) => {
      const scope = scopeRef.current;
      if (!scope) return;

      const now = performance.now();
      if (now - lastSpawnRef.current < 70) return;
      lastSpawnRef.current = now;

      const rect = scope.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return;

      const batch: VaporParticle[] = [
        {
          id: idRef.current++,
          x: relX + (Math.random() - 0.5) * 14,
          y: relY + (Math.random() - 0.5) * 14,
          kind: Math.random() > 0.45 ? "drop" : "mist",
          size: 0.55 + Math.random() * 0.55,
        },
      ];

      if (Math.random() > 0.4) {
        batch.push({
          id: idRef.current++,
          x: relX + (Math.random() - 0.5) * 22,
          y: relY + (Math.random() - 0.5) * 18,
          kind: "mist",
          size: 0.7 + Math.random() * 0.8,
        });
      }

      setVapors((prev) => [...prev.slice(-36), ...batch]);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      className="theme-motion theme-motion--aqua theme-motion--aqua-sea theme-motion--page"
      aria-hidden
    >
      {BUBBLES.map((b, i) => (
        <span
          key={`bubble-${i}`}
          className="theme-motion-particle aqua-bg-bubble"
          style={
            {
              left: b.left,
              top: b.top,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              "--motion-scale": b.scale,
            } as CSSProperties
          }
        >
          <span className="theme-motion-bubble" />
        </span>
      ))}

      {creatures.map((c, i) => (
        <span
          key={`creature-${i}`}
          className={`aqua-sea-creature aqua-sea-creature--${c.kind}`}
          style={
            {
              left: c.left,
              top: c.top,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              "--creature-scale": c.scale,
              "--creature-flip": c.flip ? -1 : 1,
            } as CSSProperties
          }
        >
          <span className="aqua-sea-creature-emoji">{c.emoji}</span>
        </span>
      ))}

      <div className="aqua-mouse-trail">
        {vapors.map((v) => (
          <span
            key={v.id}
            className={`aqua-mouse-vapor aqua-mouse-vapor--${v.kind}`}
            style={
              {
                left: v.x,
                top: v.y,
                "--vapor-size": v.size,
              } as CSSProperties
            }
            onAnimationEnd={() => removeVapor(v.id)}
          />
        ))}
      </div>
    </div>
  );
}

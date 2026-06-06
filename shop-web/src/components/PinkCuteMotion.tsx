"use client";

import { useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { useMouseScopeTrail } from "@/lib/use-mouse-scope-trail";
import { buildBalancedItems } from "@/lib/theme-motion-layout";

type PinkTrail = {
  id: number;
  x: number;
  y: number;
  kind: "heart" | "sparkle" | "blossom";
  size: number;
  rotate: number;
};

const FLOAT_ITEMS = buildBalancedItems(30, 1);
const TRAIL_KINDS: PinkTrail["kind"][] = ["heart", "heart", "sparkle", "blossom"];

export function PinkCuteMotion() {
  const spawn = useCallback((relX: number, relY: number, seed: number): Omit<PinkTrail, "id">[] => {
    const batch: Omit<PinkTrail, "id">[] = [
      {
        x: relX + (Math.random() - 0.5) * 16,
        y: relY + (Math.random() - 0.5) * 14,
        kind: TRAIL_KINDS[seed % TRAIL_KINDS.length],
        size: 0.75 + (seed % 4) * 0.15,
        rotate: -20 + (seed % 40),
      },
    ];
    if (seed % 3 === 0) {
      batch.push({
        x: relX + (Math.random() - 0.5) * 24,
        y: relY + (Math.random() - 0.5) * 20,
        kind: "sparkle",
        size: 0.65 + (seed % 3) * 0.12,
        rotate: seed % 30,
      });
    }
    return batch;
  }, []);

  const { particles, removeParticle } = useMouseScopeTrail(spawn, {
    throttleMs: 75,
    maxKeep: 36,
  });

  const trailEmoji = useMemo(
    () =>
      ({
        heart: "♥",
        sparkle: "✨",
        blossom: "🌸",
      }) as const,
    [],
  );

  return (
    <div className="theme-motion theme-motion--pink theme-motion--page" aria-hidden>
      {FLOAT_ITEMS.map((item, index) => (
        <span
          key={`float-${index}`}
          className="theme-motion-particle"
          style={
            {
              left: item.left,
              top: item.top,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`,
              "--motion-scale": item.scale,
            } as CSSProperties
          }
        >
          <span className="theme-motion-heart">♥</span>
        </span>
      ))}

      <div className="pink-mouse-trail">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`pink-mouse-particle pink-mouse-particle--${p.kind}`}
            style={
              {
                left: p.x,
                top: p.y,
                "--trail-size": p.size,
                "--trail-rotate": `${p.rotate}deg`,
              } as CSSProperties
            }
            onAnimationEnd={() => removeParticle(p.id)}
          >
            {trailEmoji[p.kind]}
          </span>
        ))}
      </div>
    </div>
  );
}

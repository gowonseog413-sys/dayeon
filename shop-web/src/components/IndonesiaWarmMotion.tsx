"use client";

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useMouseScopeTrail } from "@/lib/use-mouse-scope-trail";
import { buildBalancedItems } from "@/lib/theme-motion-layout";

type IndoTrail = {
  id: number;
  x: number;
  y: number;
  kind: "petal" | "flower" | "ember";
  size: number;
  rotate: number;
};

const FLOAT_ITEMS = buildBalancedItems(30, 3);
const PETAL_EMOJI = ["✿", "❋", "🌺"] as const;

export function IndonesiaWarmMotion() {
  const spawn = useCallback((relX: number, relY: number, seed: number): Omit<IndoTrail, "id">[] => {
    const kinds: IndoTrail["kind"][] = ["petal", "flower", "ember"];
    const batch: Omit<IndoTrail, "id">[] = [
      {
        x: relX + (Math.random() - 0.5) * 18,
        y: relY + (Math.random() - 0.5) * 16,
        kind: kinds[seed % kinds.length],
        size: 0.72 + (seed % 4) * 0.16,
        rotate: -25 + (seed % 50),
      },
    ];
    if (seed % 3 !== 1) {
      batch.push({
        x: relX + (Math.random() - 0.5) * 26,
        y: relY + (Math.random() - 0.5) * 22,
        kind: "petal",
        size: 0.6 + (seed % 3) * 0.12,
        rotate: seed % 60,
      });
    }
    return batch;
  }, []);

  const { particles, removeParticle } = useMouseScopeTrail(spawn, {
    throttleMs: 80,
    maxKeep: 34,
  });

  return (
    <div className="theme-motion theme-motion--indonesia theme-motion--page" aria-hidden>
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
          <span className="theme-motion-petal">{index % 2 === 0 ? "✿" : "❋"}</span>
        </span>
      ))}

      <div className="indo-mouse-trail">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`indo-mouse-particle indo-mouse-particle--${p.kind}`}
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
            {p.kind === "ember" ? (
              <span className="indo-mouse-ember" />
            ) : p.kind === "flower" ? (
              PETAL_EMOJI[2]
            ) : (
              PETAL_EMOJI[p.rotate % 2 === 0 ? 0 : 1]
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

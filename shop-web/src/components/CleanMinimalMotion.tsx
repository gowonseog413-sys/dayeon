"use client";

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useMouseScopeTrail } from "@/lib/use-mouse-scope-trail";
import { buildBalancedItems } from "@/lib/theme-motion-layout";

type CleanTrail = {
  id: number;
  x: number;
  y: number;
  kind: "dot" | "ring" | "line";
  size: number;
  rotate: number;
};

const FLOAT_ITEMS = buildBalancedItems(28, 2);

export function CleanMinimalMotion() {
  const spawn = useCallback((relX: number, relY: number, seed: number): Omit<CleanTrail, "id">[] => {
    const kind: CleanTrail["kind"] =
      seed % 3 === 0 ? "ring" : seed % 3 === 1 ? "line" : "dot";
    const batch: Omit<CleanTrail, "id">[] = [
      {
        x: relX + (Math.random() - 0.5) * 12,
        y: relY + (Math.random() - 0.5) * 12,
        kind,
        size: 0.7 + (seed % 4) * 0.14,
        rotate: (seed % 8) * 15,
      },
    ];
    if (seed % 2 === 0) {
      batch.push({
        x: relX + (Math.random() - 0.5) * 20,
        y: relY + (Math.random() - 0.5) * 18,
        kind: "dot",
        size: 0.55 + (seed % 3) * 0.1,
        rotate: 0,
      });
    }
    return batch;
  }, []);

  const { particles, removeParticle } = useMouseScopeTrail(spawn, {
    throttleMs: 90,
    maxKeep: 30,
  });

  return (
    <div className="theme-motion theme-motion--clean theme-motion--page" aria-hidden>
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
          <span className="theme-motion-dot" />
        </span>
      ))}

      <div className="clean-mouse-trail">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`clean-mouse-particle clean-mouse-particle--${p.kind}`}
            style={
              {
                left: p.x,
                top: p.y,
                "--trail-size": p.size,
                "--trail-rotate": `${p.rotate}deg`,
              } as CSSProperties
            }
            onAnimationEnd={() => removeParticle(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

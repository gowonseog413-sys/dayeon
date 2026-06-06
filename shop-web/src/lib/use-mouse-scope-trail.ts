"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useMouseScopeTrail<T extends { id: number }>(
  spawn: (relX: number, relY: number, seed: number) => Omit<T, "id">[],
  options?: { throttleMs?: number; maxKeep?: number },
) {
  const { throttleMs = 80, maxKeep = 32 } = options ?? {};
  const [particles, setParticles] = useState<T[]>([]);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const scopeRef = useRef<HTMLElement | null>(null);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    scopeRef.current =
      document.querySelector(".theme-motion--page") ||
      document.querySelector(".site-motion-scope");

    const onMove = (e: MouseEvent) => {
      const scope = scopeRef.current;
      if (!scope) return;

      const now = performance.now();
      if (now - lastSpawnRef.current < throttleMs) return;
      lastSpawnRef.current = now;

      const rect = scope.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return;

      const seed = idRef.current;
      const batch = spawn(relX, relY, seed).map((item, i) => ({
        ...item,
        id: seed + i,
      })) as T[];
      idRef.current += batch.length;

      setParticles((prev) => [...prev.slice(-maxKeep), ...batch]);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [spawn, throttleMs, maxKeep]);

  return { particles, removeParticle };
}

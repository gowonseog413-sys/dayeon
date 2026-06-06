"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Props = {
  href: string;
  label: string;
  value: string | number;
  accent?: string;
};

export function ErpDashboardStatCard({ href, label, value, accent = "#e11d8f" }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [motion, setMotion] = useState({ transform: "", glow: "50% 50%" });

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    setMotion({
      transform: `perspective(720px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.03)`,
      glow: `${px * 100}% ${py * 100}%`,
    });
  }

  function onLeave() {
    setMotion({ transform: "", glow: "50% 50%" });
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: motion.transform || undefined,
        background: `radial-gradient(circle at ${motion.glow}, ${accent}14 0%, transparent 55%), white`,
      }}
      className="group relative block overflow-hidden rounded-xl border border-gray-200 p-3 shadow-sm transition-[box-shadow,border-color,transform] duration-200 ease-out hover:border-[var(--pink-accent)]/40 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pink-accent)]"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        aria-hidden
      />
      <p className="text-xs text-gray-500 transition-colors group-hover:text-gray-700">{label}</p>
      <p
        className="mt-0.5 text-xl font-semibold text-gray-900 transition-transform duration-200 group-hover:scale-[1.02]"
        style={{ color: motion.transform ? accent : undefined }}
      >
        {value}
      </p>
      <p className="mt-2 text-[10px] font-medium text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        클릭하여 이동 →
      </p>
    </Link>
  );
}

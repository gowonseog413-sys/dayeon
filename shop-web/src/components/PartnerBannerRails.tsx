"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePartnerBanners } from "@/components/PartnerBannerProvider";
import type { PartnerBannerSlot } from "@/lib/partner-banners";

const CONTENT_MAX_PX = 1152; /* max-w-6xl */
const BANNER_GAP = 16;

function measureContentColumn() {
  const main = document.querySelector("main");
  if (!main) return null;

  const blocks = main.querySelectorAll<HTMLElement>(".max-w-6xl");
  let best: DOMRect | null = null;
  blocks.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 400) return;
    if (!best || r.width > best.width) best = r;
  });

  if (best) return best;

  const r = main.getBoundingClientRect();
  const w = Math.min(CONTENT_MAX_PX, r.width);
  const left = r.left + (r.width - w) / 2;
  return new DOMRect(left, r.top, w, r.height);
}

function viewportWidth() {
  return document.documentElement.clientWidth;
}

function clampLeft(left: number, bannerW: number) {
  const max = viewportWidth() - bannerW - 4;
  return Math.max(4, Math.min(left, max));
}

function gutterFits(contentLeft: number, contentRight: number, bannerW: number) {
  const vw = viewportWidth();
  const leftSpace = contentLeft - BANNER_GAP;
  const rightSpace = vw - contentRight - BANNER_GAP;
  return leftSpace >= bannerW || rightSpace >= bannerW;
}

/** 본문(max-w-6xl) 좌·우 여백에 정확히 배치 */
function usePartnerBannerPosition(
  railRef: React.RefObject<HTMLElement | null>,
  side: "left" | "right",
  active: boolean,
) {
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !active) return;

    const place = () => {
      const col = measureContentColumn();
      if (!col) return;

      const bannerW = rail.offsetWidth || rail.querySelector(".partner-banner-slot")?.clientWidth || 0;
      if (bannerW <= 0) return;

      if (!gutterFits(col.left, col.right, bannerW)) {
        rail.style.display = "none";
        return;
      }
      rail.style.display = "";

      if (side === "left") {
        const gutter = col.left - BANNER_GAP;
        const left = clampLeft((gutter - bannerW) / 2, bannerW);
        rail.style.left = `${left}px`;
        rail.style.right = "auto";
      } else {
        const gutterStart = col.right + BANNER_GAP;
        const gutterEnd = viewportWidth();
        const left = clampLeft(
          gutterStart + (gutterEnd - gutterStart - bannerW) / 2,
          bannerW,
        );
        rail.style.left = `${left}px`;
        rail.style.right = "auto";
      }
    };

    place();
    window.addEventListener("resize", place);
    const ro = new ResizeObserver(place);
    ro.observe(document.body);
    const main = document.querySelector("main");
    if (main) ro.observe(main);

    return () => {
      window.removeEventListener("resize", place);
      ro.disconnect();
      rail.style.removeProperty("left");
      rail.style.removeProperty("right");
      rail.style.removeProperty("display");
    };
  }, [railRef, side, active]);
}

/** 헤더 높이 + 스크롤 속도 기반 부드러운 따라오기 */
function usePartnerBannerMotion(railRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const header = document.querySelector("header");
    const syncSticky = () => {
      const headerH = header?.getBoundingClientRect().height ?? 152;
      const top = headerH + 14;
      rail.style.setProperty("--partner-sticky-top", `${top}px`);
    };

    syncSticky();
    window.addEventListener("resize", syncSticky);
    const ro = header ? new ResizeObserver(syncSticky) : null;
    ro?.observe(header);

    const stack = rail.querySelector<HTMLElement>(".partner-banner-stack");
    let raf = 0;
    let onScroll: (() => void) | undefined;

    if (!reduceMotion && stack) {
      let offset = 0;
      let velocity = 0;
      let lastScrollY = window.scrollY;

      const tick = () => {
        velocity *= 0.82;
        offset += velocity;
        offset *= 0.88;
        if (Math.abs(offset) < 0.15) offset = 0;
        if (Math.abs(velocity) < 0.05) velocity = 0;
        stack.style.setProperty("--partner-motion-y", `${offset.toFixed(2)}px`);
        if (Math.abs(offset) > 0.1 || Math.abs(velocity) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
        }
      };

      onScroll = () => {
        const y = window.scrollY;
        const delta = y - lastScrollY;
        lastScrollY = y;
        velocity += delta * 0.06;
        velocity = Math.max(-28, Math.min(28, velocity));
        if (!raf) raf = requestAnimationFrame(tick);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", syncSticky);
      if (onScroll) window.removeEventListener("scroll", onScroll);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      rail.style.removeProperty("--partner-sticky-top");
      stack?.style.removeProperty("--partner-motion-y");
    };
  }, [railRef]);
}

function BannerLink({ slot, index }: { slot: PartnerBannerSlot; index: number }) {
  const href = slot.url.trim();
  const inner = (
    <span
      className="partner-banner-slot relative block aspect-square w-full overflow-hidden rounded-2xl border-2 border-[var(--pink-border)] bg-white shadow-[0_4px_20px_var(--pink-shadow)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Image
        src={slot.image}
        alt=""
        fill
        unoptimized
        className="object-cover object-center"
        sizes="(min-width: 1280px) 16rem, 0px"
      />
    </span>
  );

  if (!href) return inner;

  const link = href.match(/^https?:\/\//i) ? href : `https://${href}`;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  );
}

function BannerRail({ slots, side }: { slots: PartnerBannerSlot[]; side: "left" | "right" }) {
  const railRef = useRef<HTMLElement>(null);
  usePartnerBannerPosition(railRef, side, slots.length > 0);
  usePartnerBannerMotion(railRef);

  if (!slots.length) return null;

  return (
    <aside
      ref={railRef}
      className={`partner-banner-rail partner-banner-rail--${side}`}
      aria-label={side === "left" ? "제휴 배너 (왼쪽)" : "제휴 배너 (오른쪽)"}
    >
      <div className="partner-banner-stack">
        {slots.map((slot, i) => (
          <BannerLink key={`${side}-${i}-${slot.image}`} slot={slot} index={i} />
        ))}
      </div>
    </aside>
  );
}

/** 본문 레이아웃 유지 — 좌·우 여백 오버레이 (body 포털) */
export function PartnerBannerRails() {
  const pathname = usePathname();
  const { partnerBanners, visible } = usePartnerBanners();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || pathname.startsWith("/erp") || !visible) return null;

  return createPortal(
    <div className="partner-banner-layer" aria-hidden={false}>
      <BannerRail slots={partnerBanners.left} side="left" />
      <BannerRail slots={partnerBanners.right} side="right" />
    </div>,
    document.body,
  );
}

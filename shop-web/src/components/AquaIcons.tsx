"use client";

import { useId, type ReactNode } from "react";
import type { SocialChannels } from "@/lib/social-channels";
import { SocialLink } from "@/components/SocialLink";

type IconProps = { className?: string };

function AquaGradDef({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="55%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
  );
}

/** 아쿠아 클린 — 물방울 마크 */
export function AquaLogoMark({ className = "h-9 w-9" }: IconProps) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden>
      <AquaGradDef id={gradId} />
      <path
        d="M18 5c-5.2 8.4-10 13.2-10 18.6A10 10 0 1 0 28 23.6C28 18.2 23.2 13.4 18 5Z"
        fill={`url(#${gradId})`}
        opacity="0.92"
      />
      <path
        d="M12 24c2.2 1.6 4.4 2.4 6 2.4s3.8-.8 6-2.4"
        stroke="#e0f2fe"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AquaWaveLine({ className = "h-2 w-16" }: IconProps) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 72 10" fill="none" aria-hidden overflow="visible">
      <AquaGradDef id={gradId} />
      <path
        d="M0 5.5c6-2.5 12-2.5 18 0s12 2.5 18 0 12-2.5 18 0 12 2.5 18 0"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 헤더용 — 단색 바다 블루 실루엣 */
export function AquaIconUser({ className = "h-[1.35rem] w-[1.35rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.2" r="3.4" fill="#0e7490" />
      <path
        d="M5.5 19.8c.6-3.4 3.2-5.8 6.5-5.8s5.9 2.4 6.5 5.8"
        fill="#0e7490"
        opacity="0.88"
      />
      <circle cx="17.8" cy="6.2" r="1.1" fill="#67e8f9" opacity="0.85" />
    </svg>
  );
}

export function AquaIconBag({ className = "h-[1.35rem] w-[1.35rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.2 9.2V7.5a3.8 3.8 0 0 1 7.6 0v1.7"
        stroke="#0e7490"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.2 9.2h9.6l-.85 10.2H8.05L7.2 9.2Z"
        fill="#0e7490"
        opacity="0.92"
      />
      <path
        d="M9.2 13.2h5.6"
        stroke="#a5f3fc"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="17.6" cy="7.1" r="1" fill="#67e8f9" opacity="0.9" />
    </svg>
  );
}

export function AquaIconSearch({ className = "h-5 w-5" }: IconProps) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <AquaGradDef id={gradId} />
      <circle cx="11" cy="11" r="5.5" stroke={`url(#${gradId})`} strokeWidth="1.75" />
      <path d="M15.5 15.5L19 19" stroke={`url(#${gradId})`} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function AquaBubbleRing({ className = "" }: { className?: string }) {
  return (
    <span className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <span className="absolute inset-0 rounded-full border border-cyan-200/60" />
      <span className="absolute inset-[3px] rounded-full border border-sky-100/90" />
    </span>
  );
}

function AquaSocialChip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span
      className="relative flex h-10 w-10 items-center justify-center text-[#0e7490] transition hover:scale-105"
      title={label}
      aria-label={label}
    >
      <AquaBubbleRing />
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_3px_12px_rgba(14,116,144,0.14)] ring-1 ring-sky-100">
        {children}
      </span>
      <span className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300/90" aria-hidden />
    </span>
  );
}

export function AquaIconFacebook({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3.2H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7V10.8H7v3.2h2.6V22h3.9z" />
    </svg>
  );
}

export function AquaIconInstagram({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AquaIconTikTok({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 5.2c-.8 1-2 1.7-3.3 1.8v3.4c0 3.5-2.2 5.8-5.5 5.8-1.2 0-2.3-.4-3.2-1.1 1.6.2 3.1-.9 3.6-2.5H8.5V9.2c2.2.1 4-1.5 4.4-3.6h2.6v4.2c1 .3 2 .1 2.8-.5l.2 2.9z" />
    </svg>
  );
}

export function AquaSocialIcons({ channels }: { channels: SocialChannels }) {
  return (
    <div className="flex items-center gap-2.5">
      <AquaSocialChip label="Facebook" href={channels.facebook}>
        <AquaIconFacebook />
      </AquaSocialChip>
      <AquaSocialChip label="Instagram" href={channels.instagram}>
        <AquaIconInstagram />
      </AquaSocialChip>
      <AquaSocialChip label="TikTok" href={channels.tiktok}>
        <AquaIconTikTok />
      </AquaSocialChip>
    </div>
  );
}

/** 헤더 마이정보·내가방 — 물방울 링 프레임 */
export function AquaHeaderIconFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11 ${className}`}>
      <AquaBubbleRing />
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_4px_14px_rgba(14,116,144,0.15)] ring-1 ring-sky-100 transition group-hover:shadow-[0_6px_18px_rgba(34,211,238,0.2)] sm:h-9 sm:w-9">
        {children}
      </span>
      <span
        className="pointer-events-none absolute -bottom-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-cyan-200/50 blur-[2px]"
        aria-hidden
      />
      <span className="pointer-events-none absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-cyan-300/90" aria-hidden />
    </span>
  );
}

/** 마이정보·내가방 카드 하단 물결 */
export function AquaHeaderActionShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`relative flex min-w-[4.5rem] flex-col items-center overflow-hidden rounded-2xl border border-sky-100 bg-white px-3 py-2.5 text-center shadow-[0_4px_18px_rgba(14,116,144,0.08)] transition group-hover:border-cyan-200 group-hover:shadow-[0_8px_24px_rgba(34,211,238,0.14)] sm:min-w-[4.85rem] ${className}`}
    >
      <span
        className="pointer-events-none absolute -right-2 -top-2 h-5 w-5 rounded-full bg-cyan-100/50"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -left-1.5 bottom-3 h-2.5 w-2.5 rounded-full bg-sky-100/80"
        aria-hidden
      />
      {children}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 w-full text-cyan-100/80"
        viewBox="0 0 80 8"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 5c8-3 16-3 24 0s16 3 24 0 16-3 24 0 8 3 8 3v3H0V5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

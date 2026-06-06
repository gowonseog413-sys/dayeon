"use client";

import { useId, type ReactNode } from "react";
import type { SocialChannels } from "@/lib/social-channels";
import { SocialLink } from "@/components/SocialLink";

type IconProps = { className?: string };

function GoldGradDef({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3c4" />
        <stop offset="45%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#9a7b2f" />
      </linearGradient>
      <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/** 다크 프리미엄 — 렌즈/다이아몬드 글로우 마크 */
export function DarkLogoMark({ className = "h-9 w-9" }: IconProps) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden>
      <GoldGradDef id={gradId} />
      <path
        d="M18 4 30 18 18 32 6 18 18 4Z"
        fill={`url(#${gradId})`}
        filter={`url(#${gradId}-glow)`}
        opacity="0.95"
      />
      <path
        d="M18 10v16M12 18h12"
        stroke="#fff8dc"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function DarkGlowLine({ className = "h-2 w-16" }: IconProps) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 72 8" fill="none" aria-hidden overflow="visible">
      <GoldGradDef id={gradId} />
      <path
        d="M0 4h72"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        filter={`url(#${gradId}-glow)`}
        opacity="0.85"
      />
    </svg>
  );
}

export function DarkIconUser({ className = "h-[1.35rem] w-[1.35rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.2" r="3.4" stroke="#d4af37" strokeWidth="1.6" />
      <path
        d="M5.5 19.8c.6-3.4 3.2-5.8 6.5-5.8s5.9 2.4 6.5 5.8"
        stroke="#d4af37"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DarkIconBag({ className = "h-[1.35rem] w-[1.35rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.2 9.2V7.5a3.8 3.8 0 0 1 7.6 0v1.7"
        stroke="#d4af37"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.2 9.2h9.6l-.85 10.2H8.05L7.2 9.2Z"
        stroke="#d4af37"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.2 13.2h5.6" stroke="#f5e6a8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function DarkIconSearch({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="5.5" stroke="#d4af37" strokeWidth="1.75" />
      <path d="M15.5 15.5L19 19" stroke="#d4af37" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function DarkSocialChip({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <SocialLink
      href={href}
      label={label}
      className="relative flex h-10 w-10 items-center justify-center text-[#d4af37] transition hover:scale-105"
    >
      <span
        className="absolute inset-0 rounded-full bg-[#0a0a0a] shadow-[0_0_14px_rgba(212,175,55,0.22)]"
        aria-hidden
      />
      <span className="absolute inset-0 rounded-full border border-[#3a3428]" aria-hidden />
      <span className="relative flex h-full w-full items-center justify-center rounded-full">{children}</span>
    </SocialLink>
  );
}

export function DarkIconFacebook({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3.2H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7V10.8H7v3.2h2.6V22h3.9z" />
    </svg>
  );
}

export function DarkIconInstagram({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DarkIconTikTok({ className = "h-[1.05rem] w-[1.05rem]" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 5.2c-.8 1-2 1.7-3.3 1.8v3.4c0 3.5-2.2 5.8-5.5 5.8-1.2 0-2.3-.4-3.2-1.1 1.6.2 3.1-.9 3.6-2.5H8.5V9.2c2.2.1 4-1.5 4.4-3.6h2.6v4.2c1 .3 2 .1 2.8-.5l.2 2.9z" />
    </svg>
  );
}

export function DarkSocialIcons({ channels }: { channels: SocialChannels }) {
  return (
    <div className="flex items-center gap-2.5">
      <DarkSocialChip label="Facebook" href={channels.facebook}>
        <DarkIconFacebook />
      </DarkSocialChip>
      <DarkSocialChip label="Instagram" href={channels.instagram}>
        <DarkIconInstagram />
      </DarkSocialChip>
      <DarkSocialChip label="TikTok" href={channels.tiktok}>
        <DarkIconTikTok />
      </DarkSocialChip>
    </div>
  );
}

export function DarkHeaderIconFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11 ${className}`}>
      <span
        className="pointer-events-none absolute inset-0 rounded-lg border border-[#3a3428] shadow-[0_0_12px_rgba(212,175,55,0.12)]"
        aria-hidden
      />
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#0a0a0a] ring-1 ring-[#3a3428] transition group-hover:shadow-[0_0_16px_rgba(212,175,55,0.28)] sm:h-9 sm:w-9">
        {children}
      </span>
      <span
        className="pointer-events-none absolute -top-0.5 left-1 h-1 w-3 rounded-full bg-[#d4af37]/40 blur-[2px]"
        aria-hidden
      />
    </span>
  );
}

export function DarkHeaderActionShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`relative flex min-w-[4.5rem] flex-col items-center overflow-hidden rounded-xl border border-[#3a3428] bg-[#0a0a0a] px-3 py-2.5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.45),0_0_24px_rgba(212,175,55,0.06)] transition group-hover:border-[#d4af37]/40 group-hover:shadow-[0_6px_28px_rgba(212,175,55,0.12)] sm:min-w-[4.85rem] ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent"
        aria-hidden
      />
      {children}
    </span>
  );
}

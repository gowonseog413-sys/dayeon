"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/messages";
import { useI18n } from "@/components/I18nProvider";
import { useTheme } from "@/components/ThemeProvider";
import type { SiteTheme } from "@/lib/theme";

const DROPDOWN_LOCALES: { code: Locale; short: string; name: string }[] = [
  { code: "ko", short: "KR", name: "KOREAN" },
  { code: "en", short: "US", name: "ENGLISH" },
  { code: "id", short: "ID", name: "INDONESIA" },
];

type Props = {
  /** 모바일 햄버거 메뉴 안 — 1:1 문의 아래 */
  placement?: "footer" | "drawer";
};

const TRIGGER_STYLES: Record<SiteTheme, string> = {
  pink:
    "bg-[var(--pink-deep)] text-white shadow-[0_2px_10px_var(--pink-shadow)] hover:bg-[var(--pink-accent)]",
  clean:
    "border border-gray-300 bg-neutral-900 text-white shadow-md hover:bg-neutral-800",
  indonesia:
    "border border-[#a61e24] bg-[#c1272d] text-white shadow-[0_2px_10px_rgba(193,39,45,0.2)] hover:bg-[#a61e24]",
  dark:
    "border border-[#3a3428] bg-[#0d0d0d] text-[var(--pink-accent)] shadow-[0_2px_12px_rgba(0,0,0,0.45)] hover:border-[var(--pink-accent)]/60",
  aqua:
    "border border-sky-300 bg-gradient-to-r from-sky-700 to-cyan-600 text-white shadow-[0_2px_12px_rgba(2,132,199,0.25)] hover:from-sky-800 hover:to-cyan-700",
};

const MENU_STYLES: Record<SiteTheme, string> = {
  pink: "border-[var(--pink-border)] bg-white",
  clean: "border-gray-200 bg-white",
  indonesia: "border-[#ecd5c8] bg-[#fffbf7]",
  dark: "border-[#3a3428] bg-[#141414]",
  aqua: "border-sky-200 bg-white",
};

const ITEM_ACTIVE: Record<SiteTheme, string> = {
  pink: "bg-[var(--pink-bg)] text-[var(--pink-deep)]",
  clean: "bg-gray-100 text-neutral-900",
  indonesia: "bg-[#fdf6f0] text-[#7a1b1f]",
  dark: "bg-[#1f1a12] text-[var(--pink-accent)]",
  aqua: "bg-cyan-50 text-sky-800",
};

const ITEM_IDLE: Record<SiteTheme, string> = {
  pink: "text-neutral-900 hover:bg-[var(--pink-bg-soft)]",
  clean: "text-neutral-900 hover:bg-gray-50",
  indonesia: "text-[#2c1810] hover:bg-[#fdf6f0]",
  dark: "text-[var(--text)] hover:bg-[#1a1a1a]",
  aqua: "text-slate-800 hover:bg-sky-50",
};

export function LanguageSwitcher({ placement = "footer" }: Props) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = DROPDOWN_LOCALES.find((l) => l.code === locale) ?? DROPDOWN_LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  if (pathname.startsWith("/erp")) return null;

  return (
    <div ref={rootRef} className="relative mt-4 inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex min-w-[9.5rem] items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-[11px] font-bold tracking-wider transition ${TRIGGER_STYLES[theme]}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>
          {current.short} {current.name}
        </span>
        <span
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute left-0 z-50 min-w-full overflow-hidden rounded-xl border py-1 shadow-xl ${MENU_STYLES[theme]} ${
            placement === "drawer" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          {DROPDOWN_LOCALES.map((item) => (
            <li key={item.code} role="option" aria-selected={locale === item.code}>
              <button
                type="button"
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
                className={`flex w-full items-baseline gap-2 px-4 py-3 text-left text-[11px] font-bold tracking-wider transition ${
                  locale === item.code ? ITEM_ACTIVE[theme] : ITEM_IDLE[theme]
                }`}
              >
                <span>{item.short}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

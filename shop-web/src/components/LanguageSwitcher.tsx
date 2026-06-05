"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/messages";
import { useI18n } from "@/components/I18nProvider";

const DROPDOWN_LOCALES: { code: Locale; short: string; name: string }[] = [
  { code: "ko", short: "KR", name: "KOREAN" },
  { code: "en", short: "US", name: "ENGLISH" },
  { code: "id", short: "ID", name: "INDONESIA" },
];

type Props = {
  /** 모바일 햄버거 메뉴 안 — 1:1 문의 아래 */
  placement?: "footer" | "drawer";
};

export function LanguageSwitcher({ placement = "footer" }: Props) {
  const pathname = usePathname();
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
        className="flex min-w-[9.5rem] items-center justify-between gap-3 rounded-lg bg-neutral-900 px-3.5 py-2.5 text-[11px] font-bold tracking-wider text-white shadow-md"
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
          className={`absolute left-0 z-50 min-w-full overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl ${
            inDrawer ? "top-full mt-2" : "bottom-full mb-2"
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
                className={`flex w-full items-baseline gap-2 px-4 py-3 text-left text-[11px] font-bold tracking-wider transition hover:bg-gray-50 ${
                  locale === item.code ? "bg-[var(--pink-bg)] text-[var(--pink-deep)]" : "text-neutral-900"
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

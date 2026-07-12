"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/messages";
import { useI18n } from "@/components/I18nProvider";

const OPTIONS: { code: Locale; short: string; name: string }[] = [
  { code: "ko", short: "KR", name: "한국어" },
  { code: "en", short: "US", name: "English" },
  { code: "id", short: "ID", name: "Indonesia" },
];

export function ErpLanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-[5.5rem] items-center justify-between gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("erp.shell.langAria")}
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

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-xl border border-[#d8d0c6] bg-white py-1 shadow-xl"
        >
          {OPTIONS.map((item) => (
            <li key={item.code} role="option" aria-selected={locale === item.code}>
              <button
                type="button"
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
                className={`flex w-full items-baseline gap-2 px-4 py-2.5 text-left text-xs font-medium transition ${
                  locale === item.code
                    ? "bg-[#f5f0e8] text-[#4a6b68]"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="font-bold tracking-wider">{item.short}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

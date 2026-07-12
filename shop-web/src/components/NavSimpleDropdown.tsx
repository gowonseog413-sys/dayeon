"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import type { NavItem } from "@/content/nav-menus";
import { navItemDropdownClass } from "@/lib/nav-item-class";

type Props = {
  label: string;
  items: NavItem[];
  isClean?: boolean;
};

export function NavSimpleDropdown({ label, items, isClean = false }: Props) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const sync = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex shrink-0 touch-manipulation items-center"
      onMouseEnter={() => {
        if (window.matchMedia("(min-width: 768px)").matches) setOpen(true);
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        ref={triggerRef}
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) {
              const rect = triggerRef.current?.getBoundingClientRect();
              if (rect) setPanelTop(rect.bottom + 6);
            }
            return next;
          });
        }}
        className={navItemDropdownClass(isClean, open)}
      >
        {label}
        <span className="ml-1 text-[10px] opacity-60 md:hidden" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/25 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            className="fixed left-3 right-3 z-[60] max-h-[min(60vh,20rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-xl md:absolute md:left-1/2 md:right-auto md:top-full md:max-h-none md:min-w-[180px] md:-translate-x-1/2 md:rounded-none md:shadow-lg"
            style={isMobile ? { top: panelTop } : undefined}
          >
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href ?? "#"}
                  className="block px-4 py-2.5 text-sm hover:bg-[var(--pink-bg)] hover:text-[var(--pink-accent)]"
                  onClick={() => setOpen(false)}
                >
                  {item.labelKey ? t(item.labelKey) : item.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

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

export function NavMegaMenu({ label, items, isClean = false }: Props) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mobileMid, setMobileMid] = useState<string | null>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const sync = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  const itemLabel = (item: NavItem) => (item.labelKey ? t(item.labelKey) : item.label);
  const [activeId, setActiveId] = useState<string | null>(
    items.find((i) => i.children?.length)?.id ?? null,
  );

  const active = items.find((i) => i.id === activeId);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) setMobileMid(null);
  }, [open]);

  function syncPanelTop() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPanelTop(rect.bottom + 6);
  }

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        syncPanelTop();
        if (!activeId) {
          const first = items.find((i) => i.children?.length);
          if (first) setActiveId(first.id);
        }
      }
      return next;
    });
  }

  return (
    <div
      ref={rootRef}
      className="relative inline-flex shrink-0 touch-manipulation items-center"
      onMouseEnter={() => {
        if (window.matchMedia("(min-width: 768px)").matches) {
          setOpen(true);
          if (!activeId) {
            const first = items.find((i) => i.children?.length);
            if (first) setActiveId(first.id);
          }
        }
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggleOpen}
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
          <div
            className="fixed left-3 right-3 z-[60] flex max-h-[min(70vh,24rem)] flex-col overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-xl md:absolute md:left-1/2 md:right-auto md:top-full md:max-h-none md:min-w-[320px] md:w-auto md:-translate-x-1/2 md:flex-row md:rounded-none md:shadow-lg"
            style={isMobile ? { top: panelTop } : undefined}
          >
            <ul className="min-w-0 border-b border-gray-100 md:min-w-[200px] md:border-b-0 md:border-r">
              {items.map((item) => (
                <li key={item.id}>
                  {item.href && !item.children?.length ? (
                    <Link
                      href={item.href}
                      className="block px-4 py-2.5 text-sm hover:bg-[var(--pink-bg)] hover:text-[var(--pink-accent)]"
                      onClick={() => setOpen(false)}
                    >
                      {itemLabel(item)}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm md:justify-start ${
                        activeId === item.id || mobileMid === item.id
                          ? "bg-[var(--pink-accent)] text-white md:bg-[var(--pink-accent)]"
                          : "hover:bg-[var(--pink-bg)]"
                      }`}
                      onMouseEnter={() => {
                        if (window.matchMedia("(min-width: 768px)").matches) setActiveId(item.id);
                      }}
                      onClick={() => {
                        if (window.matchMedia("(max-width: 767px)").matches) {
                          setMobileMid((v) => (v === item.id ? null : item.id));
                        } else {
                          setActiveId(item.id);
                        }
                      }}
                    >
                      {itemLabel(item)}
                      {item.children?.length ? (
                        <span className="text-xs md:ml-auto">{">"}</span>
                      ) : null}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {active?.children && active.children.length > 0 ? (
              <ul className="hidden min-w-[200px] py-1 md:block">
                {active.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--pink-bg)] hover:text-[var(--pink-accent)]"
                      onClick={() => setOpen(false)}
                    >
                      {child.swatch ? (
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-gray-200"
                          style={{ background: child.swatch }}
                        />
                      ) : null}
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {items.map((item) =>
              item.children?.length && mobileMid === item.id ? (
                <ul key={`m-${item.id}`} className="border-t border-gray-100 py-1 md:hidden">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--pink-bg)] hover:text-[var(--pink-accent)]"
                        onClick={() => setOpen(false)}
                      >
                        {child.swatch ? (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border border-gray-200"
                            style={{ background: child.swatch }}
                          />
                        ) : null}
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null,
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

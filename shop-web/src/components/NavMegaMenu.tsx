"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const itemLabel = (item: NavItem) => (item.labelKey ? t(item.labelKey) : item.label);
  const [activeId, setActiveId] = useState<string | null>(
    items.find((i) => i.children?.length)?.id ?? null,
  );

  const active = items.find((i) => i.id === activeId);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => {
        setOpen(true);
        if (!activeId) {
          const first = items.find((i) => i.children?.length);
          if (first) setActiveId(first.id);
        }
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={navItemDropdownClass(isClean, open)}>
        {label}
      </span>

      {open && (
        <div className="absolute left-1/2 top-full z-[60] flex min-w-[320px] -translate-x-1/2 border border-gray-100 bg-white py-2 shadow-lg">
          <ul className="min-w-[200px] border-r border-gray-100">
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
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                      activeId === item.id
                        ? "bg-[var(--pink-accent)] text-white"
                        : "hover:bg-[var(--pink-bg)]"
                    }`}
                    onMouseEnter={() => setActiveId(item.id)}
                  >
                    {itemLabel(item)}
                    {item.children?.length ? <span className="text-xs">›</span> : null}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {active?.children && active.children.length > 0 && (
            <ul className="min-w-[200px] py-1">
              {active.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--pink-bg)] hover:text-[var(--pink-accent)]"
                    onClick={() => setOpen(false)}
                  >
                    {child.swatch && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-gray-200"
                        style={{ background: child.swatch }}
                      />
                    )}
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

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

export function NavSimpleDropdown({ label, items, isClean = false }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={navItemDropdownClass(isClean, open)}>
        {label}
      </span>
      {open && (
        <ul className="absolute left-1/2 top-full z-[60] min-w-[180px] -translate-x-1/2 border border-gray-100 bg-white py-2 shadow-lg">
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
      )}
    </div>
  );
}

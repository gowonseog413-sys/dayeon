"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryTreeNode } from "@/lib/product-catalog-store";

type Props = {
  main: CategoryTreeNode;
  onNavigate?: () => void;
};

export function MobileCategoryAccordion({ main, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [activeMid, setActiveMid] = useState<string | null>(null);

  const hasChildren = (main.children || []).length > 0;
  const mainHref = main.href;

  if (!hasChildren && mainHref) {
    return (
      <Link
        href={mainHref}
        onClick={onNavigate}
        className="block py-2 font-medium text-gray-900 hover:text-[var(--pink-accent)]"
      >
        {main.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2.5 text-left font-medium text-gray-900"
        aria-expanded={open}
      >
        {main.label}
        <span className="text-xs text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <ul className="mb-3 space-y-1 pl-1">
          {(main.children || []).map((mid) => {
            const subs = mid.children || [];
            if (subs.length === 0 && mid.href) {
              return (
                <li key={mid.id}>
                  <Link
                    href={mid.href}
                    onClick={onNavigate}
                    className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-[var(--pink-bg)] hover:text-[var(--pink-accent)]"
                  >
                    {mid.label}
                  </Link>
                </li>
              );
            }
            const midOpen = activeMid === mid.id;
            return (
              <li key={mid.id}>
                <button
                  type="button"
                  onClick={() => setActiveMid(midOpen ? null : mid.id)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                  aria-expanded={midOpen}
                >
                  {mid.label}
                  <span className="text-[10px] text-gray-400">{midOpen ? "−" : "+"}</span>
                </button>
                {midOpen ? (
                  <ul className="mb-2 ml-2 space-y-0.5 border-l border-gray-100 pl-3">
                    {subs.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={sub.href || "#"}
                          onClick={onNavigate}
                          className="flex items-center gap-2 py-1.5 text-sm text-gray-600 hover:text-[var(--pink-accent)]"
                        >
                          {sub.swatch ? (
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-gray-200"
                              style={{ background: sub.swatch }}
                            />
                          ) : null}
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

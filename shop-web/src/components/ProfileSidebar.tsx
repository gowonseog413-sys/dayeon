"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/profile", label: "내 프로필" },
  { href: "/profile/payment", label: "결제수단관리" },
  { href: "/profile/points", label: "포인트/등급" },
  { href: "/profile/orders", label: "내 주문" },
  { href: "/profile/address", label: "내 배송 주소" },
  { href: "/profile/wishlist", label: "내 위시리스트" },
  { href: "/profile/reviews", label: "내 리뷰" },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-4 text-sm shadow-[0_4px_18px_var(--pink-shadow)] md:w-48">
      <nav className="flex flex-row flex-wrap gap-1 md:flex-col md:gap-0">
        {LINKS.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/profile/orders" && pathname === "/account");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 transition ${
                active
                  ? "bg-[var(--pink-bg)] font-semibold text-[var(--pink-accent)]"
                  : "text-gray-700 hover:bg-[var(--pink-bg-soft)] hover:text-[var(--pink-accent)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

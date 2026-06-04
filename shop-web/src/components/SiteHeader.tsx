"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth-store";
import { cartCount } from "@/lib/cart-store";
import type { User } from "@/lib/types";

const NAV = [
  { href: "/?section=contact-lenses", label: "콘택트렌즈" },
  { href: "/?section=accessories", label: "렌즈 액세서리" },
  { href: "/?section=best-seller", label: "신규 도착" },
  { href: "/?section=bundles", label: "번들" },
  { href: "/?section=bloominc", label: "블루밍크" },
  { href: "#", label: "기사" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [bag, setBag] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    setUser(getStoredUser());
    setBag(cartCount());
    const refresh = () => setBag(cartCount());
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (pathname.startsWith("/erp")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="bg-sky-100 py-1.5 text-center text-xs text-sky-900">
        FREE SHIPPING UP TO 10K · SAVE UP TO 40%
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link href="/" className="font-serif-logo shrink-0 text-2xl font-semibold tracking-widest">
          EYESIGHT
        </Link>
        <form
          className="mx-auto flex max-w-xl flex-1 items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/?q=${encodeURIComponent(q)}`;
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="필요한 걸 여기서 검색해봐..."
            className="w-full bg-transparent text-sm outline-none"
          />
          <span className="text-gray-400">🔍</span>
        </form>
        <div className="flex shrink-0 items-center gap-5 text-xs">
          <Link href={user ? "/account" : "/login"} className="flex flex-col items-center text-center">
            <span className="text-lg text-[var(--pink-accent)]">👤</span>
            <span className="text-gray-500">내 계좌</span>
            <span className="font-medium">
              {user ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}` : "로그인 / 가입"}
            </span>
          </Link>
          <Link href="/bag" className="flex flex-col items-center text-center">
            <span className="text-lg text-[var(--pink-accent)]">🛍</span>
            <span className="text-gray-500">내 가방</span>
            <span className="font-medium">({bag})</span>
          </Link>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl justify-center gap-8 border-t border-gray-50 px-4 py-3 text-sm text-gray-700">
        {NAV.map((item) => (
          <Link key={item.label} href={item.href} className="hover:text-[var(--pink-accent)]">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth-store";
import type { User } from "@/lib/types";

const LINKS = [
  { href: "/erp", label: "대시보드" },
  { href: "/erp/products", label: "상품 관리" },
  { href: "/erp/orders", label: "주문 관리" },
  { href: "/erp/users", label: "회원 관리" },
];

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u || u.role !== "admin") {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        ERP 권한 확인 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">dayeon ERP · 1차 초안</p>
            <h1 className="font-serif-logo text-lg">EYESIGHT Admin</h1>
          </div>
          <Link href="/" className="text-sm text-[var(--pink-accent)]">
            쇼핑몰 보기
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="w-44 shrink-0 space-y-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded px-3 py-2 ${
                path === l.href ? "bg-[var(--pink-accent)] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

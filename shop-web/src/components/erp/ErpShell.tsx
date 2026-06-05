"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ErpNavLink } from "@/components/erp/ErpNavLink";
import {
  ERP_MODULES,
  getActiveErpModule,
  isErpModuleActive,
  isErpSubActive,
} from "@/lib/erp-nav";

type Props = {
  children: React.ReactNode;
};

export function ErpShell({ children }: Props) {
  const path = usePathname();
  const module = getActiveErpModule(path);
  const showSubNav = module.subs.length > 0;

  return (
    <div className="erp-shell flex min-h-screen flex-col bg-[#ece8e3]">
      {/* 상단 헤더 — 전체 너비 */}
      <header className="erp-top-frame shrink-0 border-b border-[#3d5553] bg-[#4a6b68] px-4 py-2 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-white/75">dayeon ERP</p>
            <h1 className="text-lg font-semibold tracking-tight">dayeon Admin</h1>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full border border-white/35 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
          >
            쇼핑몰 보기
          </Link>
        </div>
      </header>

      <div className="erp-body flex min-h-0 flex-1">
        {/* 왼쪽 프레임 — 메인 메뉴 */}
        <aside
          className="erp-left-frame w-[13.5rem] shrink-0 border-r border-[#d8d0c6] bg-[#f5f0e8] px-3 py-3"
          aria-label="ERP 메인 메뉴"
        >
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7f72]">
            메뉴
          </p>
          <nav className="space-y-1">
            {ERP_MODULES.map((m) => {
              const active = isErpModuleActive(m, path);
              return (
                <ErpNavLink
                  key={m.id}
                  href={m.href}
                  active={active}
                  variant="side"
                >
                  {m.label}
                </ErpNavLink>
              );
            })}
          </nav>
        </aside>

        {/* 오른쪽 영역: 상단 서브 탭 + 중앙 콘텐츠 */}
        <div className="erp-right-col flex min-w-0 flex-1 flex-col">
          {/* 오른쪽 상단 프레임 — 선택한 메뉴의 서브 탭 (2개 이상일 때) */}
          {showSubNav && (
            <nav
              className="erp-topnav-frame shrink-0 border-b border-[#ddd5cb] bg-[#faf6f0] px-3 py-1"
              aria-label="ERP 서브 메뉴"
            >
              <ul className="flex flex-wrap gap-1.5">
                {module.subs.map((sub) => {
                  const active = isErpSubActive(sub, path);
                  return (
                    <li key={sub.href}>
                      <ErpNavLink
                        href={sub.href}
                        active={active}
                        variant="sub"
                      >
                        {sub.label}
                      </ErpNavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* 중앙 프레임 — 본문 */}
          <main className="erp-center-frame min-h-0 flex-1 overflow-auto bg-[#f7f5f2] p-3 sm:p-4">
            <div
              className={`mx-auto w-full ${path.startsWith("/erp/users") || path.startsWith("/erp/products") ? "max-w-none" : "max-w-6xl"}`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { useIndexBanner } from "@/components/IndexBannerProvider";
import type { CategoryTreeNode } from "@/lib/product-catalog-store";
import {
  isMegaMenuMain,
  treeMainToMegaItems,
  treeMainToSimpleItems,
  useLocalizedShopCatalog,
} from "@/lib/use-shop-catalog";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/lib/auth-store";
import { cartCount } from "@/lib/cart-store";
import { DayeonLogo } from "@/components/DayeonLogo";
import { NavMegaMenu } from "@/components/NavMegaMenu";
import { NavSimpleDropdown } from "@/components/NavSimpleDropdown";
import {
  AquaHeaderActionShell,
  AquaHeaderIconFrame,
  AquaIconBag,
  AquaIconSearch,
  AquaIconUser,
} from "@/components/AquaIcons";
import {
  DarkHeaderActionShell,
  DarkHeaderIconFrame,
  DarkIconBag,
  DarkIconSearch,
  DarkIconUser,
} from "@/components/DarkIcons";
import { IconBag, IconSearch, IconUser } from "@/components/CleanIcons";
import { IconBagID, IconUserID } from "@/components/IndonesiaIcons";
import { useTheme } from "@/components/ThemeProvider";
import {
  isAquaTheme,
  isDarkTheme,
  isIndonesiaTheme,
  isMinimalTheme,
} from "@/lib/theme";
import { NavHeartDivider } from "@/components/SparkleHeart";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { honorificName } from "@/lib/user-display";
import { navItemLinkClass } from "@/lib/nav-item-class";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/erp") || pathname.startsWith("/admin-gate")) return null;
  return <SiteHeaderInner />;
}

function ShopNavMain({
  main,
  isClean,
  navLinkClass,
}: {
  main: CategoryTreeNode;
  isClean: boolean;
  navLinkClass: string;
}) {
  if (isMegaMenuMain(main)) {
    return (
      <NavMegaMenu label={main.label} items={treeMainToMegaItems(main)} isClean={isClean} />
    );
  }
  if (main.children && main.children.length > 0) {
    return (
      <NavSimpleDropdown label={main.label} items={treeMainToSimpleItems(main)} isClean={isClean} />
    );
  }
  return (
    <Link href={main.href || "#"} className={navLinkClass}>
      {main.label}
    </Link>
  );
}

function SiteHeaderInner() {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const { text: bannerText } = useIndexBanner();
  const { theme } = useTheme();
  const isIndonesia = isIndonesiaTheme(theme);
  const isDark = isDarkTheme(theme);
  const isAqua = isAquaTheme(theme);
  const isCleanOnly = theme === "clean";
  const isCleanNav = isCleanOnly || isAqua || isDark;
  const [hydrated, setHydrated] = useState(false);
  const [bag, setBag] = useState(0);
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { catalog } = useLocalizedShopCatalog();

  useEffect(() => {
    setHydrated(true);
    const refresh = () => setBag(user ? cartCount() : 0);
    refresh();
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(AUTH_UPDATED_EVENT, refresh);
    };
  }, [user]);

  const accountHref = hydrated && user ? "/profile" : "/login";
  const accountLabel =
    hydrated && user
      ? honorificName(user)
      : hydrated && ready
        ? t("header.login")
        : "...";

  const headerActionClass = isDark
    ? "group text-[11px]"
    : isAqua
    ? "group text-[11px]"
    : isIndonesia
    ? "group flex min-w-[4.25rem] flex-col items-center rounded-lg border border-[var(--pink-border)] bg-white px-2.5 py-2 text-center text-[11px] shadow-sm transition hover:border-[var(--pink-accent)]/40 hover:bg-[var(--pink-bg-soft)] sm:min-w-[4.75rem] sm:px-3"
    : isCleanOnly
      ? "group flex min-w-[4.25rem] flex-col items-center rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-center text-[11px] shadow-sm transition hover:border-gray-400 hover:bg-gray-50 sm:min-w-[4.75rem] sm:px-3"
      : "group flex min-w-[4.25rem] flex-col items-center rounded-2xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-2.5 py-2 text-center text-[11px] shadow-[0_4px_18px_var(--pink-shadow)] transition hover:border-[rgba(233,30,140,0.35)] hover:bg-white sm:min-w-[4.75rem] sm:px-3";
  const headerIconClass = isDark
    ? "flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#3a3428] bg-[#0d0d0d] text-[var(--pink-accent)] transition group-hover:border-[var(--pink-accent)]/70 sm:h-10 sm:w-10"
    : isAqua
    ? ""
    : isIndonesia
    ? "flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[var(--pink-border)] bg-[var(--pink-bg-soft)] transition group-hover:border-[var(--pink-accent)]/50 sm:h-10 sm:w-10"
    : isCleanOnly
      ? "flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 text-gray-700 transition group-hover:border-gray-400 group-hover:bg-white sm:h-10 sm:w-10"
      : "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--pink-border)] bg-white text-base shadow-inner transition group-hover:border-[rgba(233,30,140,0.45)] sm:h-10 sm:w-10 sm:text-lg";
  const searchFormClass = isDark
    ? "mx-auto flex max-w-xl flex-1 items-center gap-2 rounded-full border border-[#3a3428] bg-[#141414] px-4 py-2.5 shadow-[0_2px_14px_rgba(0,0,0,0.35)] sm:px-5"
    : isAqua
    ? "mx-auto flex max-w-xl flex-1 items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2.5 shadow-[0_2px_14px_rgba(2,132,199,0.08)] sm:px-5"
    : isCleanOnly
    ? "mx-auto flex max-w-xl flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-[0_2px_14px_rgba(15,23,42,0.06)] sm:px-5"
    : "mx-auto flex max-w-xl flex-1 items-center rounded-full border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2.5 shadow-inner sm:px-4";
  const searchInputClass = isDark
    ? "w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
    : isAqua || isCleanOnly
    ? "w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
    : "w-full bg-transparent text-sm outline-none";
  const accountLabelClass = isDark
    ? "max-w-[5.5rem] truncate text-[10px] font-bold text-[var(--pink-accent)] sm:max-w-[6.5rem] sm:text-[11px]"
    : isAqua
    ? "max-w-[5.5rem] truncate text-[10px] font-bold text-[var(--pink-deep)] sm:max-w-[6.5rem] sm:text-[11px]"
    : "max-w-[5.5rem] truncate text-[10px] font-semibold text-[var(--pink-deep)] sm:max-w-[6.5rem] sm:text-[11px]";
  const navScrollClass =
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] touch-pan-x";
  const navClass = isDark
    ? [
        "relative flex items-center gap-5 text-sm text-[var(--muted)]",
        "flex-nowrap justify-start overflow-x-auto scroll-smooth px-4 py-2.5",
        navScrollClass,
        "md:flex-wrap md:justify-center md:gap-3 md:overflow-visible",
        "md:rounded-full md:border md:border-[#3a3428] md:bg-[#141414] md:px-6 md:py-3 md:shadow-[0_2px_14px_rgba(0,0,0,0.35)]",
      ].join(" ")
    : isAqua
    ? [
        "relative flex items-center gap-5 text-sm text-gray-600",
        "flex-nowrap justify-start overflow-x-auto scroll-smooth px-4 py-2.5",
        navScrollClass,
        "md:flex-wrap md:justify-center md:gap-3 md:overflow-visible",
        "md:rounded-full md:border md:border-sky-200 md:bg-white md:px-6 md:py-3 md:shadow-[0_2px_14px_rgba(2,132,199,0.08)]",
      ].join(" ")
    : isCleanNav
    ? [
        "relative flex items-center gap-5 text-sm text-gray-600",
        "flex-nowrap justify-start overflow-x-auto scroll-smooth px-4 py-2.5",
        navScrollClass,
        "md:flex-wrap md:justify-center md:gap-3 md:overflow-visible",
        "md:rounded-full md:border md:border-gray-200 md:bg-white md:px-6 md:py-3 md:shadow-[0_2px_14px_rgba(15,23,42,0.06)]",
      ].join(" ")
    : [
        "relative flex items-center gap-5 text-sm text-gray-700",
        "flex-nowrap justify-start overflow-x-auto scroll-smooth px-4 py-2.5",
        navScrollClass,
        "md:flex-wrap md:justify-center md:gap-3 md:overflow-visible",
        "md:rounded-2xl md:border-2 md:border-[var(--pink-border)] md:bg-[var(--pink-bg-soft)] md:px-4 md:py-3 md:shadow-[0_4px_18px_var(--pink-shadow)]",
      ].join(" ");
  const navLinkClass = navItemLinkClass(isCleanNav);

  return (
    <header
      className={`sticky top-0 z-50 shadow-sm backdrop-blur-sm ${
        isDark
          ? "border-b border-[#3a3428] bg-[#0d0d0d]/95"
          : isAqua
          ? "border-b border-sky-100 bg-white/95"
          : isCleanOnly
          ? "border-b border-gray-100 bg-white/95"
          : "border-b border-[var(--pink-border)] bg-white/95"
      }`}
    >
      <div className="banner-gingham py-2 text-center text-xs font-medium text-[var(--pink-deep)]">
        {bannerText || t("banner.shipping")}
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:gap-6">
        <DayeonLogo variant="header" />
        <form
          className={searchFormClass}
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/?q=${encodeURIComponent(q)}`;
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className={searchInputClass}
          />
          {isAqua ? (
            <AquaIconSearch className="h-5 w-5 shrink-0" />
          ) : isDark ? (
            <DarkIconSearch className="h-5 w-5 shrink-0" />
          ) : isCleanNav ? (
            <IconSearch className="h-5 w-5 shrink-0 text-gray-500" />
          ) : (
            <span className="text-[var(--pink-accent)]">🔍</span>
          )}
        </form>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 md:flex sm:gap-3">
          <Link href={accountHref} className={headerActionClass}>
            {isDark ? (
              <DarkHeaderActionShell>
                <DarkHeaderIconFrame className="mb-1">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <DarkIconUser />
                  )}
                </DarkHeaderIconFrame>
                <span className="relative z-[1] text-[10px] text-[var(--muted)] sm:text-[11px]">
                  {t("header.account")}
                </span>
                <span className={`relative z-[1] ${accountLabelClass}`}>{accountLabel}</span>
              </DarkHeaderActionShell>
            ) : isAqua ? (
              <AquaHeaderActionShell>
                <AquaHeaderIconFrame className="mb-1">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <AquaIconUser />
                  )}
                </AquaHeaderIconFrame>
                <span className="relative z-[1] text-[10px] text-slate-500 sm:text-[11px]">
                  {t("header.account")}
                </span>
                <span className={`relative z-[1] ${accountLabelClass}`}>{accountLabel}</span>
              </AquaHeaderActionShell>
            ) : (
              <>
                <span className={`mb-0.5 ${headerIconClass}`}>
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : isIndonesia ? (
                    <IconUserID className="h-9 w-9 sm:h-10 sm:w-10" />
                  ) : isCleanNav ? (
                    <IconUser className="h-5 w-5" />
                  ) : (
                    <span className="text-[var(--pink-accent)]" aria-hidden>
                      ♡
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-500 sm:text-[11px]">{t("header.account")}</span>
                <span className={accountLabelClass}>{accountLabel}</span>
              </>
            )}
          </Link>
          <Link href="/bag" className={headerActionClass}>
            {isDark ? (
              <DarkHeaderActionShell>
                <DarkHeaderIconFrame className="mb-1">
                  <DarkIconBag />
                </DarkHeaderIconFrame>
                <span className="relative z-[1] text-[10px] text-[var(--muted)] sm:text-[11px]">
                  {t("header.bag")}
                </span>
                <span
                  className={`relative z-[1] mt-0.5 inline-flex items-center justify-center text-[10px] sm:text-[11px] ${
                    bag > 0
                      ? "min-w-[1.35rem] rounded-full bg-[var(--pink-accent)] px-2 py-0.5 font-bold text-black shadow-[0_0_10px_rgba(212,175,55,0.35)]"
                      : "min-w-[1.35rem] rounded-full bg-[#1a1a1a] px-2 py-0.5 font-semibold text-[var(--muted)] ring-1 ring-[#3a3428]"
                  }`}
                >
                  {bag}
                </span>
              </DarkHeaderActionShell>
            ) : isAqua ? (
              <AquaHeaderActionShell>
                <AquaHeaderIconFrame className="mb-1">
                  <AquaIconBag />
                </AquaHeaderIconFrame>
                <span className="relative z-[1] text-[10px] text-slate-500 sm:text-[11px]">
                  {t("header.bag")}
                </span>
                <span
                  className={`relative z-[1] mt-0.5 inline-flex items-center justify-center text-[10px] sm:text-[11px] ${
                    bag > 0
                      ? "min-w-[1.35rem] rounded-full bg-[#0e7490] px-2 py-0.5 font-bold text-white shadow-sm"
                      : "min-w-[1.35rem] rounded-full bg-cyan-50 px-2 py-0.5 font-semibold text-cyan-800 ring-1 ring-cyan-100"
                  }`}
                >
                  {bag}
                </span>
              </AquaHeaderActionShell>
            ) : (
              <>
                <span className={`mb-0.5 ${headerIconClass}`}>
                  {isIndonesia ? (
                    <IconBagID className="h-9 w-9 sm:h-10 sm:w-10" />
                  ) : isCleanNav ? (
                    <IconBag className="h-5 w-5" />
                  ) : (
                    <span className="text-[var(--pink-accent)]" aria-hidden>
                      🛍
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-500 sm:text-[11px]">{t("header.bag")}</span>
                <span
                  className={`mt-0.5 inline-flex min-w-[1.75rem] items-center justify-center px-2 py-0.5 text-[10px] font-bold sm:text-[11px] ${
                isDark
                  ? bag > 0
                    ? "rounded-full bg-[var(--pink-accent)] px-2.5 text-black"
                    : "rounded-full bg-[#242424] px-2.5 text-[var(--muted)]"
                  : isIndonesia
                  ? bag > 0
                    ? "rounded-md bg-[var(--pink-accent)] text-white"
                    : "rounded-md bg-[var(--pink-bg)] text-[var(--pink-deep)]"
                  : isCleanOnly
                    ? bag > 0
                      ? "rounded-md bg-gray-900 text-white"
                      : "rounded-md bg-gray-100 text-gray-600"
                    : bag > 0
                    ? "rounded-full bg-[var(--pink-accent)] text-white shadow-sm"
                    : "rounded-full bg-white text-gray-500 ring-1 ring-[var(--pink-border)]"
              }`}
            >
              {bag}
            </span>
              </>
            )}
          </Link>
          </div>
          <MobileNavDrawer
            open={menuOpen}
            onOpen={() => setMenuOpen(true)}
            onClose={() => setMenuOpen(false)}
            accountHref={accountHref}
            accountLabel={accountLabel}
            bag={bag}
            isClean={isCleanNav || isIndonesia}
          />
        </div>
      </div>
      <div
        className={`mx-auto max-w-6xl md:px-4 md:pb-3 ${
          isDark
            ? "border-b border-[#3a3428]/60 md:border-b-0"
            : isAqua
            ? "border-b border-sky-100 md:border-b-0"
            : isCleanOnly
            ? "border-b border-gray-100 md:border-b-0"
            : "border-b border-[var(--pink-border)]/40 md:border-b-0"
        }`}
      >
        <nav className={navClass} aria-label="메인 메뉴">
          {catalog.categoryTree.map((main, i) => (
            <span key={main.id} className="contents">
              {i > 0 ? <NavHeartDivider index={i} /> : null}
              <ShopNavMain main={main} isClean={isCleanNav} navLinkClass={navLinkClass} />
            </span>
          ))}
          <NavHeartDivider index={catalog.categoryTree.length} />
          <Link href="/articles" className={navLinkClass}>
            {t("nav.articles")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

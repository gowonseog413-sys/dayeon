"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/I18nProvider";
import { MobileCategoryAccordion } from "@/components/MobileCategoryAccordion";
import { MOBILE_MENU_MAIN, MOBILE_MENU_SUPPORT } from "@/lib/mobile-menu";
import { useLocalizedShopCatalog } from "@/lib/use-shop-catalog";

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  accountHref: string;
  accountLabel: string;
  bag: number;
  isClean?: boolean;
};

export function MobileNavDrawer({
  open,
  onOpen,
  onClose,
  accountHref,
  accountLabel,
  bag,
  isClean = false,
}: Props) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { catalog } = useLocalizedShopCatalog();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pathname 변경 시만 닫기
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = "block py-0.5 text-sm text-gray-700 hover:text-[var(--pink-accent)]";

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={onOpen}
        className={
          isClean
            ? "flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-gray-300 bg-white"
            : "flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border-2 border-[var(--pink-border)] bg-white"
        }
      >
        <span className="block h-0.5 w-5 rounded-full bg-gray-800" />
        <span className="block h-0.5 w-6 rounded-full bg-gray-800" />
        <span className="block h-0.5 w-4 rounded-full bg-gray-800" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <aside
            className="absolute inset-y-0 right-0 flex w-[min(100%,18.5rem)] flex-col bg-white shadow-2xl"
            aria-label="모바일 메뉴"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-[var(--pink-deep)]">메뉴</span>
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="mb-5 space-y-3 border-b border-gray-100 pb-5">
                <li>
                  <Link href={accountHref} onClick={onClose} className={linkClass}>
                    {t("header.account")}
                    {accountLabel !== "..." && accountLabel !== t("header.login") ? (
                      <span className="text-gray-500"> · {accountLabel}</span>
                    ) : null}
                  </Link>
                </li>
                <li>
                  <Link href="/bag" onClick={onClose} className={linkClass}>
                    {t("header.bag")}
                    <span className="text-gray-500"> ({bag})</span>
                  </Link>
                </li>
              </ul>

              <p className="mb-2 text-sm font-semibold text-gray-900">{t("mobile.shopping")}</p>
              <div className="mb-5 border-b border-gray-100 pb-5">
                {catalog.categoryTree.map((main) => (
                  <MobileCategoryAccordion key={main.id} main={main} onNavigate={onClose} />
                ))}
                <Link
                  href="/articles"
                  onClick={onClose}
                  className="block border-t border-gray-100 py-2.5 font-medium text-gray-900 hover:text-[var(--pink-accent)]"
                >
                  {t("nav.articles")}
                </Link>
              </div>

              <ul className="space-y-3 text-sm text-gray-700">
                {MOBILE_MENU_MAIN.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-0.5 hover:text-[var(--pink-accent)]"
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mb-2 mt-6 text-sm font-semibold text-gray-900">
                {t("footer.support")}
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                {MOBILE_MENU_SUPPORT.map((item) =>
                  "mailto" in item ? (
                    <li key={item.labelKey}>
                      <a
                        href={`mailto:${t("brand.email")}`}
                        onClick={onClose}
                        className="block py-0.5 hover:text-[var(--pink-accent)]"
                      >
                        {t(item.labelKey)}
                      </a>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block py-0.5 hover:text-[var(--pink-accent)]"
                      >
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <LanguageSwitcher placement="drawer" />
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

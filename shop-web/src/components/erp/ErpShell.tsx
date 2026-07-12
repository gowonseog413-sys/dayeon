"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpLanguageSwitcher } from "@/components/erp/ErpLanguageSwitcher";
import { ErpNavLink } from "@/components/erp/ErpNavLink";
import { ErpNavigationProvider } from "@/components/erp/ErpNavigationProvider";
import { ErpSaveSuccessProvider } from "@/components/erp/ErpSaveSuccessProvider";
import { useErpPermissions } from "@/hooks/useErpPermissions";
import { clearErpSession, getErpStoredUser } from "@/lib/auth-store";
import { filterErpModules, MASTER_EMAIL } from "@/lib/erp-permissions";
import {
  ERP_MODULES,
  allErpHrefs,
  getActiveErpModule,
  isErpModuleActive,
  isErpSubActive,
} from "@/lib/erp-nav";

type Props = {
  children: React.ReactNode;
};

export function ErpShell({ children }: Props) {
  const { t } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const { permissions, isMaster, loading, error, email: loginEmail } = useErpPermissions();
  const stored = getErpStoredUser();
  const localMaster = stored?.email?.toLowerCase() === MASTER_EMAIL;
  const isErpAdmin = stored?.role === "admin";
  const fullAccess =
    isMaster || localMaster || (isErpAdmin && permissions.length === 0);

  const visibleModules =
    loading || fullAccess || error
      ? ERP_MODULES
      : filterErpModules(ERP_MODULES, permissions, false);
  const module =
    visibleModules.find((m) => isErpModuleActive(m, path)) ??
    getActiveErpModule(path);
  const showSubNav = module.subs.length > 0;

  useEffect(() => {
    for (const href of allErpHrefs()) {
      router.prefetch(href);
    }
  }, [router]);

  const displayEmail = loginEmail || stored?.email || "";
  const displayName =
    [stored?.firstName, stored?.lastName].filter(Boolean).join(" ").trim() || displayEmail;

  function handleErpLogout() {
    clearErpSession();
    router.replace("/admin-gate");
  }

  const fullWidth =
    path.startsWith("/erp/users") ||
    path.startsWith("/erp/products") ||
    path.startsWith("/erp/settings");

  return (
    <ErpNavigationProvider>
    <ErpSaveSuccessProvider>
    <div className="erp-shell flex min-h-screen flex-col bg-[#ece8e3]">
      <header className="erp-top-frame shrink-0 border-b border-[#3d5553] bg-[#4a6b68] px-4 py-2 text-white shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-white/75">{t("erp.shell.brandSubtitle")}</p>
            <h1 className="text-lg font-semibold tracking-tight">{t("erp.shell.brandTitle")}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {displayEmail ? (
              <>
                <div
                  className="max-w-30 truncate text-xs text-white/90 sm:hidden"
                  title={`${displayName} (${displayEmail})`}
                >
                  {displayEmail}
                </div>
                <div className="hidden text-right text-xs leading-tight sm:block">
                  <p className="font-medium text-white">{displayName}</p>
                  <p className="text-white/70">{displayEmail}</p>
                </div>
              </>
            ) : null}
            <ErpLanguageSwitcher />
            <button
              type="button"
              onClick={handleErpLogout}
              className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 sm:px-4"
            >
              {t("erp.shell.logout")}
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 sm:px-4"
            >
              {t("erp.shell.viewShop")}
            </Link>
          </div>
        </div>
      </header>

      <div className="erp-body flex min-h-0 flex-1">
        <aside
          className="erp-left-frame w-[13.5rem] shrink-0 border-r border-[#d8d0c6] bg-[#f5f0e8] px-3 py-3"
          aria-label={t("erp.shell.mainNavAria")}
        >
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7f72]">
            {t("erp.shell.menu")}
          </p>
          <nav className="space-y-1">
            {visibleModules.map((m) => {
              const active = isErpModuleActive(m, path);
              return (
                <ErpNavLink
                  key={m.id}
                  href={m.href}
                  active={active}
                  variant="side"
                >
                  {t(m.labelKey)}
                </ErpNavLink>
              );
            })}
          </nav>
        </aside>

        <div className="erp-right-col flex min-w-0 flex-1 flex-col">
          {showSubNav && (
            <nav
              className="erp-topnav-frame shrink-0 border-b border-[#ddd5cb] bg-[#faf6f0] px-3 py-1"
              aria-label={t("erp.shell.subNavAria")}
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
                        {t(sub.labelKey)}
                      </ErpNavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <main className="erp-center-frame min-h-0 flex-1 overflow-auto bg-[#f7f5f2] p-3 sm:p-4">
            <div className={`w-full ${fullWidth ? "max-w-none" : "mx-auto max-w-6xl"}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
    </ErpSaveSuccessProvider>
    </ErpNavigationProvider>
  );
}

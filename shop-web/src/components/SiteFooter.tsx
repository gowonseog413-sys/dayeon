"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterSocial } from "@/components/FooterSocial";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/I18nProvider";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/erp")) return null;
  return <SiteFooterInner />;
}

function SiteFooterInner() {
  const { t } = useI18n();

  return (
    <footer className="site-footer relative bg-white">
      <div className="mx-auto hidden max-w-6xl gap-8 px-4 py-12 text-sm md:grid md:grid-cols-4">
        <div>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/about">{t("footer.about")}</Link></li>
            <li><Link href="/careers">{t("footer.careers")}</Link></li>
            <li><Link href="/terms">{t("footer.terms")}</Link></li>
            <li><Link href="/eye-coin">{t("footer.eyeCoin")}</Link></li>
            <li><Link href="/privacy">{t("footer.privacy")}</Link></li>
            <li><Link href="/articles">{t("footer.articles")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">{t("footer.support")}</p>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/support/faq">{t("footer.faq")}</Link></li>
            <li><Link href="/support/shipping">{t("footer.shipping")}</Link></li>
            <li><Link href="/support/returns">{t("footer.returns")}</Link></li>
            <li><Link href="/profile/inquiries">{t("footer.contact")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">{t("footer.cs")}</p>
          <a href={`mailto:${t("brand.email")}`} className="block text-gray-600 hover:text-[var(--pink-accent)]">
            {t("brand.email")}
          </a>
          <LanguageSwitcher />
        </div>
        <div className="flex items-start justify-start md:justify-end">
          <FooterSocial />
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-6 md:hidden">
        <FooterSocial />
      </div>
      <div className="site-footer-bar bg-[var(--pink-bg)] py-3 text-center text-xs text-gray-600">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}

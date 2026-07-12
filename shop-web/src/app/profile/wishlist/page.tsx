"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ProfileCartPanel } from "@/components/profile/ProfileCartPanel";
import { ProfileWishlistPanel } from "@/components/profile/ProfileWishlistPanel";

const CART_WISHLIST_TAB_IDS = ["cart", "wishlist"] as const;
type CartWishlistTabId = (typeof CART_WISHLIST_TAB_IDS)[number];

function isCartWishlistTabId(value: string | null): value is CartWishlistTabId {
  return value === "cart" || value === "wishlist";
}

function ProfileCartWishlistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const tabParam = searchParams.get("tab");
  const activeTab: CartWishlistTabId = isCartWishlistTabId(tabParam) ? tabParam : "cart";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const setTab = (id: string) => {
    router.push(`/profile/wishlist?tab=${id}`);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.push(`/profile/wishlist?${qs}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--pink-deep)]">{t("profile.title.wishlist")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("profile.desc.wishlist")}</p>

      <ErpContentTabs
        className="mt-5"
        tabs={CART_WISHLIST_TAB_IDS.map((id) => ({
          id,
          label: t(id === "cart" ? "profile.tab.cart" : "profile.tab.wishlistOnly"),
        }))}
        active={activeTab}
        onChange={setTab}
      />

      <div className="mt-6">
        {activeTab === "cart" ? (
          <ProfileCartPanel page={pageParam} onPageChange={setPage} />
        ) : (
          <ProfileWishlistPanel page={pageParam} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

export default function ProfileWishlistPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">{t("common.loading")}</p>}>
      <ProfileCartWishlistContent />
    </Suspense>
  );
}

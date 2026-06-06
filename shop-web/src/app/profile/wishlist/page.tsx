"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ProfileCartPanel } from "@/components/profile/ProfileCartPanel";
import { ProfileWishlistPanel } from "@/components/profile/ProfileWishlistPanel";

const CART_WISHLIST_TABS = [
  { id: "cart", label: "장바구니" },
  { id: "wishlist", label: "위시리스트" },
] as const;

type CartWishlistTabId = (typeof CART_WISHLIST_TABS)[number]["id"];

function isCartWishlistTabId(value: string | null): value is CartWishlistTabId {
  return value === "cart" || value === "wishlist";
}

function ProfileCartWishlistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      <h1 className="text-2xl font-semibold text-[var(--pink-deep)]">장바구니 · 위시</h1>
      <p className="mt-1 text-sm text-gray-500">
        장바구니에 담은 상품과 위시리스트에 저장한 관심 상품을 확인할 수 있습니다.
      </p>

      <ErpContentTabs
        className="mt-5"
        tabs={[...CART_WISHLIST_TABS]}
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
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">로딩 중...</p>}>
      <ProfileCartWishlistContent />
    </Suspense>
  );
}

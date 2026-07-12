"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ProfileAddressPanel } from "@/components/profile/ProfileAddressPanel";
import { ProfileMyPagePanel } from "@/components/profile/ProfileMyPagePanel";
import { ProfilePasswordPanel } from "@/components/profile/ProfilePasswordPanel";
import { ProfilePaymentPanel } from "@/components/profile/ProfilePaymentPanel";

const PROFILE_TAB_IDS = ["mypage", "address", "payment", "password"] as const;
type ProfileTabId = (typeof PROFILE_TAB_IDS)[number];

function isProfileTabId(value: string | null): value is ProfileTabId {
  return PROFILE_TAB_IDS.includes(value as ProfileTabId);
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const tabParam = searchParams.get("tab");
  const activeTab: ProfileTabId = isProfileTabId(tabParam) ? tabParam : "mypage";

  const tabs = PROFILE_TAB_IDS.map((id) => ({
    id,
    label: t(`profile.tab.${id}`),
  }));

  const setTab = (id: string) => {
    router.push(`/profile?tab=${id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--pink-deep)]">{t("profile.title.info")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("profile.desc.info")}</p>

      <ErpContentTabs className="mt-5" tabs={tabs} active={activeTab} onChange={setTab} />

      <p className="mt-4 text-xs text-gray-500">{t(`profile.tabDesc.${activeTab}`)}</p>

      <div className="mt-4">
        {activeTab === "mypage" && <ProfileMyPagePanel />}
        {activeTab === "address" && <ProfileAddressPanel />}
        {activeTab === "payment" && <ProfilePaymentPanel />}
        {activeTab === "password" && <ProfilePasswordPanel />}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">{t("common.loading")}</p>}>
      <ProfileContent />
    </Suspense>
  );
}

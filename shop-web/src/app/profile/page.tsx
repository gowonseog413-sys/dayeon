"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ProfileAddressPanel } from "@/components/profile/ProfileAddressPanel";
import { ProfileMyPagePanel } from "@/components/profile/ProfileMyPagePanel";
import { ProfilePaymentPanel } from "@/components/profile/ProfilePaymentPanel";

const PROFILE_TABS = [
  { id: "mypage", label: "마이페이지" },
  { id: "address", label: "배송주소" },
  { id: "payment", label: "결제수단" },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]["id"];

function isProfileTabId(value: string | null): value is ProfileTabId {
  return value === "mypage" || value === "address" || value === "payment";
}

const TAB_DESCRIPTION: Record<ProfileTabId, string> = {
  mypage: "이름, 연락처, 이메일 등 회원 정보를 확인하고 수정할 수 있습니다.",
  address: "배송 정보를 미리 저장해 두면 결제 시 자동으로 채워집니다.",
  payment:
    "인도네시아에서 많이 쓰는 신용카드, GoPay(충전식), 가상계좌 입금을 등록할 수 있습니다.",
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: ProfileTabId = isProfileTabId(tabParam) ? tabParam : "mypage";

  const setTab = (id: string) => {
    router.push(`/profile?tab=${id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--pink-deep)]">내 정보</h1>
      <p className="mt-1 text-sm text-gray-500">
        회원 정보, 배송 주소, 결제수단을 한곳에서 관리할 수 있습니다.
      </p>

      <ErpContentTabs
        className="mt-5"
        tabs={[...PROFILE_TABS]}
        active={activeTab}
        onChange={setTab}
      />

      <p className="mt-4 text-xs text-gray-500">{TAB_DESCRIPTION[activeTab]}</p>

      <div className="mt-4">
        {activeTab === "mypage" && <ProfileMyPagePanel />}
        {activeTab === "address" && <ProfileAddressPanel />}
        {activeTab === "payment" && <ProfilePaymentPanel />}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">로딩 중...</p>}>
      <ProfileContent />
    </Suspense>
  );
}

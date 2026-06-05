import { PrivacyPolicySection } from "@/components/PrivacyPolicySection";

/** 개인정보처리방침 전용 — 헤더·푸터만 두고 본문은 방침만 표시 */
export default function PrivacyPage() {
  return <PrivacyPolicySection standalone />;
}

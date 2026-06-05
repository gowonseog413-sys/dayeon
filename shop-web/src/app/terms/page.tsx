import { TermsOfUseSection } from "@/components/TermsOfUseSection";

/** 이용 약관 전용 — 헤더·푸터만 두고 본문은 약관만 표시 */
export default function TermsPage() {
  return <TermsOfUseSection standalone />;
}

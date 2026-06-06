import type { InquiryCategory, InquiryStatus } from "@/lib/types";

export const INQUIRY_PAGE_SIZE = 10;

export const INQUIRY_CATEGORIES: { value: InquiryCategory; label: string }[] = [
  { value: "order", label: "주문/결제" },
  { value: "delivery", label: "배송" },
  { value: "return", label: "교환/반품" },
  { value: "product", label: "상품" },
  { value: "other", label: "기타" },
];

export function inquiryCategoryLabel(category: InquiryCategory): string {
  return INQUIRY_CATEGORIES.find((c) => c.value === category)?.label ?? "기타";
}

export function inquiryStatusLabel(status: InquiryStatus): string {
  return status === "answered" ? "답변 완료" : "답변 대기";
}

"use client";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** ERP 폼 하단 저장·취소 등 액션 버튼 — 오른쪽 정렬 */
export function ErpFormActions({ children, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap justify-end gap-2 ${className}`.trim()}>{children}</div>
  );
}

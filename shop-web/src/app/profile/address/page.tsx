"use client";

import Link from "next/link";

export default function ProfileAddressPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">내 배송 주소</h1>
        <button type="button" className="text-sm text-[var(--pink-accent)]">
          + 새 주소 추가
        </button>
      </div>
      <p className="text-gray-600">저장된 배송 주소가 없습니다.</p>
      <p className="mt-2 text-sm text-gray-500">
        결제 시 입력한 주소는 주문 완료 페이지에서 확인할 수 있습니다. (초안)
      </p>
      <Link href="/checkout" className="mt-6 inline-block text-sm text-[var(--pink-accent)]">
        첫 주문하러 가기 →
      </Link>
    </div>
  );
}

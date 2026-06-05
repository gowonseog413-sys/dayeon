"use client";

import Link from "next/link";

export default function ProfileWishlistPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">내 위시리스트</h1>
      <p className="text-center text-lg text-gray-600">위시리스트에 제품 없음</p>
      <p className="mt-2 text-center text-sm text-gray-500">
        마음에 드는 렌즈를 저장하는 기능은 다음 단계에서 연결됩니다.
      </p>
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-full border border-gray-300 px-6 py-2 text-sm"
        >
          쇼핑으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function ProfileReviewsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">내 리뷰</h1>
      <div className="text-center text-gray-600">
        <p className="text-lg font-medium">아직 리뷰가 없습니다</p>
        <p className="mt-2 text-sm">
          주문을 완료한 후 제품 리뷰를 남길 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-gray-300 px-6 py-2 text-sm"
        >
          쇼핑으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

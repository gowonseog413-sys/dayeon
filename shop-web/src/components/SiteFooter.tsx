"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/erp")) return null;

  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm md:grid-cols-4">
        <div>
          <p className="mb-3 font-semibold">EYESIGHT</p>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="#">회사 소개</Link></li>
            <li><Link href="#">채용</Link></li>
            <li><Link href="#">이용약관</Link></li>
            <li><Link href="#">Eye Coins</Link></li>
            <li><Link href="#">개인정보처리방침</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">지원</p>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="#">FAQ</Link></li>
            <li><Link href="#">배송 안내</Link></li>
            <li><Link href="#">반품/교환</Link></li>
            <li><Link href="#">문의하기</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">고객 서비스</p>
          <p className="text-gray-600">help@eyesight.co.id</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">계속 연결되어 있어</p>
          <div className="flex gap-3 text-lg">📘 📷 🎵</div>
        </div>
      </div>
      <div className="bg-[var(--pink-bg)] py-3 text-center text-xs text-gray-600">
        2026 © PT Beautindo Natural Indonesia. All Right Reserved · dayeon 쇼핑몰 초안
      </div>
    </footer>
  );
}

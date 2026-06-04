"use client";

import { usePathname } from "next/navigation";

export function ChatFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/erp")) return null;

  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-2xl text-white shadow-lg"
      aria-label="채팅"
    >
      💬
    </button>
  );
}

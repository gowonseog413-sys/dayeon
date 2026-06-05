"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErpShell } from "@/components/erp/ErpShell";
import { getStoredUser } from "@/lib/auth-store";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u || u.role !== "admin") {
      setDenied(true);
      router.replace("/login");
    }
  }, [router]);

  if (denied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f2] text-sm text-gray-500">
        ERP 권한 확인 중...
      </div>
    );
  }

  return <ErpShell>{children}</ErpShell>;
}

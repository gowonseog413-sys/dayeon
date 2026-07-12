"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpShell } from "@/components/erp/ErpShell";
import {
  getErpStoredUser,
  getErpToken,
  hasErpPortalAccess,
  migrateLegacyErpShopSession,
} from "@/lib/auth-store";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    migrateLegacyErpShopSession();
    const u = getErpStoredUser();
    const token = getErpToken();
    if (!u || !token || u.role !== "admin" || !hasErpPortalAccess()) {
      setDenied(true);
      router.replace("/admin-gate");
    }
  }, [router]);

  if (denied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f2] text-sm text-gray-500">
        {t("erp.layout.verifyingAccess")}
      </div>
    );
  }

  return <ErpShell>{children}</ErpShell>;
}

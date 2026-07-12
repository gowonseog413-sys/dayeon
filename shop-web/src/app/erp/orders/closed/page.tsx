"use client";

import { Suspense } from "react";
import { ErpOrderList } from "@/components/erp/ErpOrderList";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useI18n } from "@/components/I18nProvider";

function OrdersLoadingFallback({ titleKey }: { titleKey: string }) {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey={titleKey}>
      <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
    </ErpPageShell>
  );
}

export default function ErpOrdersClosedPage() {
  return (
    <Suspense fallback={<OrdersLoadingFallback titleKey="erp.nav.ordersClosed" />}>
      <ErpOrderList tab="closed" basePath="/erp/orders/closed" titleKey="erp.nav.ordersClosed" />
    </Suspense>
  );
}

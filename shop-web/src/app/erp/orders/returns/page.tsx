"use client";

import { Suspense } from "react";
import { ErpOrderList } from "@/components/erp/ErpOrderList";
import { ErpPageShell } from "@/components/erp/ErpPageShell";

export default function ErpOrdersReturnsPage() {
  return (
    <Suspense
      fallback={
        <ErpPageShell title="반품주문">
          <p className="text-sm text-gray-500">불러오는 중…</p>
        </ErpPageShell>
      }
    >
      <ErpOrderList tab="returns" basePath="/erp/orders/returns" title="반품주문" />
    </Suspense>
  );
}

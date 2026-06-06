"use client";

import { Suspense } from "react";
import { ErpOrderList } from "@/components/erp/ErpOrderList";
import { ErpPageShell } from "@/components/erp/ErpPageShell";

export default function ErpOrdersShippingPage() {
  return (
    <Suspense
      fallback={
        <ErpPageShell title="주문배송">
          <p className="text-sm text-gray-500">불러오는 중…</p>
        </ErpPageShell>
      }
    >
      <ErpOrderList tab="shipping" basePath="/erp/orders/shipping" title="주문배송" />
    </Suspense>
  );
}

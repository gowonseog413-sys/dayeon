"use client";

import { Suspense } from "react";
import { ErpOrderList } from "@/components/erp/ErpOrderList";
import { ErpPageShell } from "@/components/erp/ErpPageShell";

export default function ErpOrdersClosedPage() {
  return (
    <Suspense
      fallback={
        <ErpPageShell title="최종마감">
          <p className="text-sm text-gray-500">불러오는 중…</p>
        </ErpPageShell>
      }
    >
      <ErpOrderList tab="closed" basePath="/erp/orders/closed" title="최종마감" />
    </Suspense>
  );
}

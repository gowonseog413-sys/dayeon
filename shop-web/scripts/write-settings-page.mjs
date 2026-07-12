import fs from "fs";

const text = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";

type EnvInfo = {
  shopUrl: string;
  erpUrl: string;
  apiUrl: string;
};

const CONTROL_LINKS = [
  { href: "/erp/theme", label: "\uD14C\uB9C8\u00B7\uB514\uC790\uC778", desc: "\uC1FC\uD551\uBAB0 \uD14C\uB9C8, \uBC30\uB108, \uD31D\uC5C5, \uCC44\uB110 URL" },
  { href: "/erp/payments", label: "\uACB0\uC81C \uCC44\uB110", desc: "\uACB0\uC81C\uC218\uB2E8 \uBC0F \uD68C\uC6D0 \uACB0\uC81C \uD504\uB85C\uD544" },
  { href: "/erp/users/points", label: "\uD3EC\uC778\uD2B8\u00B7\uC801\uB9BD\uAE08", desc: "\uB4F1\uAE09\uBCC4 \uC801\uB9BD\uB960, \uAC00\uC785 \uBCF4\uB108\uC2A4" },
  { href: "/erp/users/referral", label: "\uCD94\uCC9C\uC778 \uC81C\uB3C4", desc: "\uCD94\uCC9C \uBCF4\uC0C1 \uBC0F \uCF54\uB4DC \uAD00\uB9AC" },
  { href: "/erp/users/reviews", label: "\uB9AC\uBDF0 \uBCF4\uC0C1", desc: "\uB9AC\uBDF0 \uC791\uC131 \uD3EC\uC778\uD2B8 \uC124\uC815" },
  { href: "/erp/products/stock", label: "\uC7AC\uACE0 \uAD00\uB9AC", desc: "\uC0C1\uD488 \uC7AC\uACE0 \uC218\uB7C9 \uC870\uC815" },
  { href: "/erp/pages/about", label: "\uD558\uB2E8 \uBB38\uC11C", desc: "\uC57D\uAD00, \uAC1C\uC778\uC815\uBCF4, \uACE0\uAC1D\uC13C\uD130 \uBB38\uC11C" },
];

export default function ErpSettingsPage() {
  const [env, setEnv] = useState<EnvInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setEnv({
      shopUrl: origin || "-",
      erpUrl: origin ? \`\${origin}/erp\` : "-",
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3601",
    });

    const token = getErpToken();
    if (!token) {
      setError("\uAD00\uB9AC\uC790 \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.");
      return;
    }
    api("/api/admin/stats", { token }).catch((err) => {
      setError(err instanceof Error ? err.message : "API \uC5F0\uACB0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
    });
  }, []);

  return (
    <ErpPageShell
      title="\uD658\uACBD\uC124\uC815"
      description="\uC1FC\uD551\uBAB0\u00B7ERP \uC6B4\uC601 \uD658\uACBD\uACFC \uC8FC\uC694 \uAD00\uB9AC \uAE30\uB2A5\uC744 \uC774\uACF3\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4."
    >
      {error ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mb-6 rounded-xl border border-[#d8d0c6] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#4a6b68]">\uC811\uC18D \uC815\uBCF4</h3>
        <dl className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">\uC1FC\uD551\uBAB0</dt>
            <dd>
              {env ? (
                <a href={env.shopUrl} className="font-mono text-[var(--pink-accent)] underline">
                  {env.shopUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">ERP</dt>
            <dd>
              {env ? (
                <a href={env.erpUrl} className="font-mono text-[var(--pink-accent)] underline">
                  {env.erpUrl}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-gray-500">API</dt>
            <dd className="font-mono text-xs">{env?.apiUrl ?? "-"}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">\uAD00\uB9AC\uC790 \uACC4\uC815</h3>
        <p className="mt-2 text-sm text-amber-800">
          ERP \uC811\uC18D\uC740 \uC1FC\uD551\uBAB0 \uD478\uD130\uC758 <strong>\uAD00\uB9AC\uC790\uD398\uC774\uC9C0</strong> \uB610\uB294 \uC544\uB798 \uACC4\uC815\uC73C\uB85C\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.
        </p>
        <p className="mt-2 font-mono text-sm text-gray-800">dayeon@naver.com / admin1004</p>
        <p className="mt-2 text-xs text-amber-700">
          \uC77C\uBC18 \uD68C\uC6D0 \uB85C\uADF8\uC778(/login)\uACFC \uBCC4\uB3C4 \u2014 \uAD00\uB9AC\uC790 \uB300\uBB38(
          <Link href="/admin-gate" target="_blank" className="underline">
            /admin-gate
          </Link>
          )\uC5D0\uC11C \uC778\uC99D\uD569\uB2C8\uB2E4.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">\uAD00\uB9AC \uAE30\uB2A5 \uBC14\uB85C\uAC00\uAE30</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {CONTROL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-[#d8d0c6] bg-white px-4 py-3 transition hover:border-[#4a6b68] hover:shadow-sm"
            >
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </ErpPageShell>
  );
}
`;

fs.writeFileSync(
  new URL("../src/app/erp/settings/page.tsx", import.meta.url),
  text,
  "utf8",
);
console.log("settings page written");

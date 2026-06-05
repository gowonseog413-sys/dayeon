"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { mergeCartOnLogin } from "@/lib/cart-store";
import { saveSession } from "@/lib/auth-store";
import type { User } from "@/lib/types";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const next = searchParams.get("next") || "/";

    if (!token) {
      setError("로그인 토큰이 없습니다.");
      return;
    }

    api<{ user: User }>("/api/auth/me", { token })
      .then(async (data) => {
        saveSession(token, data.user);
        await mergeCartOnLogin(token);
        const dest = next.startsWith("/login") ? "/profile" : next;
        window.location.href = dest;
      })
      .catch(() => {
        setError("세션을 확인하지 못했습니다. 다시 로그인해 주세요.");
      });
  }, [searchParams]);

  if (error) {
    return (
      <p className="py-20 text-center text-sm text-red-600">
        {error}{" "}
        <a href="/login" className="underline">
          로그인으로
        </a>
      </p>
    );
  }

  return (
    <p className="py-20 text-center text-sm text-gray-500">Google 로그인 처리 중...</p>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm">로딩...</p>}>
      <CallbackHandler />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { googleLoginUrl } from "@/lib/oauth";

type Props = {
  nextPath?: string;
};

export function SocialLoginButtons({ nextPath = "/" }: Props) {
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ configured: boolean }>("/api/auth/google/status")
      .then((d) => setGoogleReady(d.configured))
      .catch(() => setGoogleReady(false));
  }, []);

  return (
    <div className="space-y-3">
      <a
        href={googleReady ? googleLoginUrl(nextPath) : "#"}
        onClick={(e) => {
          if (!googleReady) {
            e.preventDefault();
            alert(
              "Google OAuth 설정이 필요합니다.\n\n1. Google Cloud Console에서 OAuth 클라이언트 생성\n2. shop-api\\.env 에 GOOGLE_CLIENT_ID / SECRET 입력\n3. API 서버 재시작",
            );
          }
        }}
        className={`flex w-full items-center justify-center gap-3 rounded-full border py-3 text-sm font-medium transition ${
          googleReady
            ? "border-gray-200 bg-white hover:bg-gray-50"
            : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
        }`}
      >
        <GoogleIcon />
        Continue with Google
        {googleReady === false && (
          <span className="text-[10px] text-gray-400">(설정 필요)</span>
        )}
      </a>
      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-gray-100 bg-gray-50 py-3 text-sm text-gray-400"
        title="Facebook 로그인은 다음 단계에서 추가됩니다"
      >
        <FacebookIcon />
        Continue with Facebook
        <span className="text-[10px]">(준비 중)</span>
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.149 3.657-4.243 6.348-8.303 6.348-2.721 0-5.188-1.04-7.051-2.74l-6.522 5.025C9.505 39.556 16.227 44 24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c5.099 0 9.345-3.394 10.854-8.083z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

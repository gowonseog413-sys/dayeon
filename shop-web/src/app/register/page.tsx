"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { api } from "@/lib/api";
import { mergeCartOnLogin } from "@/lib/cart-store";
import { saveSession } from "@/lib/auth-store";
import type { User } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession(data.token, data.user);
      await mergeCartOnLogin(data.token);
      window.location.href = "/profile";
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-serif-logo text-3xl">Create an Account</h1>
      <SocialLoginButtons nextPath="/" />
      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는 이메일로 가입
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-100 p-6 shadow-sm">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {(["firstName", "lastName", "email", "password"] as const).map((key) => (
          <label key={key} className="block text-sm capitalize">
            {key === "firstName" ? "First name*" : key === "lastName" ? "Last name" : key === "email" ? "Email*" : "Password*"}
            <input
              type={key === "password" ? "password" : key === "email" ? "email" : "text"}
              required={key !== "lastName"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white"
        >
          {loading ? "가입 중..." : "Create an Account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        이미 계정이 있나요? <Link href="/login" className="text-[var(--pink-accent)]">Sign In</Link>
      </p>
    </div>
  );
}

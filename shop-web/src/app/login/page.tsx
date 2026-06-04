import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center font-serif-logo text-3xl">Sign In</h1>
      <p className="mb-8 text-center text-sm text-gray-500">EYESIGHT 계정으로 로그인</p>
      <Suspense fallback={<p className="text-center text-sm">로딩...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

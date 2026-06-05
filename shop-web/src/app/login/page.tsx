import { Suspense } from "react";
import { DayeonLogo } from "@/components/DayeonLogo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 flex justify-center">
        <DayeonLogo variant="compact" href="/" />
      </div>
      <h1 className="mb-2 text-center text-3xl font-semibold">Sign In</h1>
      <p className="mb-8 text-center text-sm text-gray-500">dayeon 계정으로 로그인</p>
      <Suspense fallback={<p className="text-center text-sm">로딩...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

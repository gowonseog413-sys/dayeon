"use client";

import { FormEvent, useEffect, useState } from "react";

type ConnectionStatus = {
  firebase: boolean;
  slack: boolean;
  slackChannel?: string;
  slackCategory?: string;
  slackWorkspace?: string;
};

export default function Home() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data: ConnectionStatus) => setStatus(data))
      .catch(() => setStatus({ firebase: false, slack: false }));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        firebase?: boolean;
        slack?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "전송에 실패했습니다.");
      }

      setResult(
        `전송 완료 · Firebase ${data.firebase ? "저장됨" : "미연결"} · Slack ${data.slack ? "알림 전송" : "웹훅 미설정"}`,
      );
      setName("");
      setMessage("");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "전송에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            dayeon
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            동생사이트
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600">
            Firebase와 Slack이 연결된 dayeon 프로젝트입니다. 메시지를 보내면
            Firestore에 저장되고 Slack 채널로 알림이 전달됩니다.
          </p>
          <a
            href="http://localhost:3010"
            className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            EYESIGHT 쇼핑몰 초안 보기 → (localhost:3010)
          </a>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <StatusCard
            title="Firebase"
            connected={status?.firebase ?? false}
            description="dayeon-3856e · Firestore"
          />
          <StatusCard
            title="Slack"
            connected={status?.slack ?? false}
            description={
              status?.slackChannel ??
              "TBP · 5 · dayeon · # dayeon-동생사이트"
            }
          />
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">메시지 보내기</h2>
          <p className="mt-2 text-sm text-zinc-500">
            테스트 메시지를 보내면 Firebase 저장과 Slack 알림을 확인할 수
            있습니다.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium">이름</span>
              <input
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-amber-200 focus:ring-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">메시지</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-amber-200 focus:ring-2"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="보낼 내용을 입력하세요"
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "전송 중..." : "Firebase + Slack으로 전송"}
            </button>
          </form>

          {result ? (
            <p className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              {result}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function StatusCard({
  title,
  connected,
  description,
}: {
  title: string;
  connected: boolean;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            connected
              ? "bg-emerald-100 text-emerald-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {connected ? "연결됨" : "설정 필요"}
        </span>
      </div>
      <p className="mt-3 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

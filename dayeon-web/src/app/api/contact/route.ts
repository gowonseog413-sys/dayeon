import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { getSlackChannelLabel, isSlackConfigured, slackConfig } from "@/lib/slack-config";
import { buildContactSlackMessage, sendSlackMessage } from "@/lib/slack";

type ContactRequest = {
  name?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequest;
    const name = body.name?.trim();
    const message = body.message?.trim();

    if (!name || !message) {
      return NextResponse.json(
        { error: "이름과 메시지를 입력해 주세요." },
        { status: 400 },
      );
    }

    if (name.length > 100 || message.length > 2000) {
      return NextResponse.json(
        { error: "입력 길이가 너무 깁니다." },
        { status: 400 },
      );
    }

    if (isFirebaseConfigured()) {
      await addDoc(collection(db, "messages"), {
        name,
        message,
        createdAt: serverTimestamp(),
      });
    }

    if (isSlackConfigured()) {
      await sendSlackMessage(buildContactSlackMessage(name, message));
    }

    return NextResponse.json({
      ok: true,
      firebase: isFirebaseConfigured(),
      slack: isSlackConfigured(),
      slackChannel: getSlackChannelLabel(),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    firebase: isFirebaseConfigured(),
    slack: isSlackConfigured(),
    slackChannel: getSlackChannelLabel(),
    slackCategory: slackConfig.categoryLabel,
    slackWorkspace: slackConfig.workspace,
  });
}

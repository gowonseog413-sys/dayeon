import { slackConfig } from "@/lib/slack-config";

type SlackMessagePayload = {
  text: string;
  blocks?: Array<Record<string, unknown>>;
};

export async function sendSlackMessage(payload: SlackMessagePayload) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL is not configured");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed: ${response.status} ${body}`);
  }
}

export function buildContactSlackMessage(name: string, message: string) {
  return {
    text: `[${slackConfig.categoryLabel}] ${name}님의 새 메시지`,
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*${slackConfig.workspace}* · 카테고리 \`${slackConfig.categoryLabel}\` · ${slackConfig.channelDisplay}`,
          },
        ],
      },
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${slackConfig.projectName} ${slackConfig.projectTitle} · 새 메시지`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*채널*\n${slackConfig.channelDisplay}` },
          { type: "mrkdwn", text: `*슬러그*\n\`${slackConfig.channelSlug}\`` },
          { type: "mrkdwn", text: `*이름*\n${name}` },
          {
            type: "mrkdwn",
            text: `*시간*\n${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*내용*\n${message}`,
        },
      },
    ],
  };
}

/**
 * TBP(더행복한사람들) Slack 채널 카테고리
 * - 1_x: 공통/공지
 * - 2_x: 행정
 * - 3_x: SL경매
 * - 4_x: 웹/앱 프로젝트
 * - 5_x: dayeon (동생사이트)
 */
export const slackConfig = {
  workspace: "TBP (더행복한사람들)",
  category: "5",
  categoryLabel: "5 · dayeon",
  channel: process.env.SLACK_CHANNEL ?? "dayeon-동생사이트",
  channelDisplay: process.env.SLACK_CHANNEL_DISPLAY ?? "# dayeon-동생사이트",
  channelSlug: "5_1-dayeon_동생사이트",
  projectName: "dayeon",
  projectTitle: "동생사이트",
} as const;

export function getSlackChannelLabel(): string {
  return `${slackConfig.categoryLabel} · ${slackConfig.channelDisplay}`;
}

export function isSlackConfigured(): boolean {
  return Boolean(process.env.SLACK_WEBHOOK_URL);
}

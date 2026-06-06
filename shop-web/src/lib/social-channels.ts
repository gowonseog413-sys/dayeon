export type SocialChannelKey = "facebook" | "instagram" | "tiktok";

export type SocialChannels = Record<SocialChannelKey, string>;

export const SOCIAL_CHANNEL_FIELDS: { key: SocialChannelKey; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
];

export const DEFAULT_SOCIAL_CHANNELS: SocialChannels = {
  facebook: "",
  instagram: "",
  tiktok: "https://www.tiktok.com/@tomas06496",
};

export function normalizeSocialChannels(raw: unknown): SocialChannels {
  const obj = raw && typeof raw === "object" ? (raw as Partial<SocialChannels>) : {};
  const pick = (key: SocialChannelKey) =>
    typeof obj[key] === "string" ? obj[key].trim() : "";
  return {
    facebook: pick("facebook"),
    instagram: pick("instagram"),
    tiktok: pick("tiktok"),
  };
}

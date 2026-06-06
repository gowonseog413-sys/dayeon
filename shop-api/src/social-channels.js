export const DEFAULT_SOCIAL_CHANNELS = {
  facebook: "",
  instagram: "",
  tiktok: "https://www.tiktok.com/@tomas06496",
};

function pickUrl(raw, key) {
  return typeof raw?.[key] === "string" ? raw[key].trim() : "";
}

export function normalizeSocialChannels(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  return {
    facebook: pickUrl(obj, "facebook"),
    instagram: pickUrl(obj, "instagram"),
    tiktok: pickUrl(obj, "tiktok"),
  };
}

export function getSocialChannels(db) {
  if (!db.settings?.socialChannels) {
    return { ...DEFAULT_SOCIAL_CHANNELS };
  }
  return normalizeSocialChannels(db.settings.socialChannels);
}

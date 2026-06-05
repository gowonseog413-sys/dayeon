const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI,
  );
}

export function buildGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
}

export async function exchangeCodeForProfile(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || tokenData.error || "Google token exchange failed");
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = await profileRes.json();
  if (!profileRes.ok) {
    throw new Error(profile.error?.message || "Google profile fetch failed");
  }

  return profile;
}

export function encodeOAuthState(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeOAuthState(state) {
  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch {
    return { next: "/" };
  }
}

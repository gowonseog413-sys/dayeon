"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useSocialChannels } from "@/components/SocialChannelProvider";
import { SocialLink } from "@/components/SocialLink";
import { IndonesiaSocialIcons } from "@/components/IndonesiaIcons";
import { AquaSocialIcons } from "@/components/AquaIcons";
import { DarkSocialIcons } from "@/components/DarkIcons";
import { IconFacebook, IconInstagram, IconTikTok } from "@/components/CleanIcons";
import { isAquaTheme, isDarkTheme, isIndonesiaTheme, isMinimalTheme } from "@/lib/theme";
import type { SocialChannelKey } from "@/lib/social-channels";

const SOCIAL = [
  { key: "facebook" as const, label: "Facebook", Icon: IconFacebook },
  { key: "instagram" as const, label: "Instagram", Icon: IconInstagram },
  { key: "tiktok" as const, label: "TikTok", Icon: IconTikTok },
] as const;

function PinkSocialIcons({ channels }: { channels: Record<SocialChannelKey, string> }) {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIAL.map(({ key, label, Icon }) => (
        <SocialLink
          key={key}
          href={channels[key]}
          label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm transition hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)]"
        >
          <Icon className="h-[1.05rem] w-[1.05rem]" />
        </SocialLink>
      ))}
    </div>
  );
}

export function FooterSocial() {
  const { theme } = useTheme();
  const { channels } = useSocialChannels();

  if (isIndonesiaTheme(theme)) {
    return <IndonesiaSocialIcons channels={channels} />;
  }

  if (isDarkTheme(theme)) {
    return <DarkSocialIcons channels={channels} />;
  }

  if (isAquaTheme(theme)) {
    return <AquaSocialIcons channels={channels} />;
  }

  if (isMinimalTheme(theme)) {
    return <PinkSocialIcons channels={channels} />;
  }

  return <PinkSocialIcons channels={channels} />;
}

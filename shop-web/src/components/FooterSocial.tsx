"use client";

import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { IndonesiaSocialIcons } from "@/components/IndonesiaIcons";
import { IconFacebook, IconInstagram, IconTikTok } from "@/components/CleanIcons";
import { isIndonesiaTheme, isMinimalTheme } from "@/lib/theme";

const SOCIAL = [
  { label: "Facebook", Icon: IconFacebook },
  { label: "Instagram", Icon: IconInstagram },
  { label: "TikTok", Icon: IconTikTok },
] as const;

export function FooterSocial() {
  const { theme } = useTheme();

  if (isIndonesiaTheme(theme)) {
    return <IndonesiaSocialIcons />;
  }

  if (isMinimalTheme(theme)) {
    return (
      <div className="flex items-center gap-2.5">
        {SOCIAL.map(({ label, Icon }) => (
          <span
            key={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm"
            title={label}
            aria-label={label}
          >
            <Icon className="h-[1.05rem] w-[1.05rem]" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <Image
      src="/brand/footer-social.png"
      alt="Facebook · Instagram · TikTok"
      width={360}
      height={140}
      unoptimized
      className="h-auto w-full max-w-[min(100%,280px)] object-contain sm:max-w-[320px]"
    />
  );
}

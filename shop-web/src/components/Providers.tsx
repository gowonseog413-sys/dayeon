"use client";

import { I18nProvider } from "@/components/I18nProvider";
import { HeroBannerProvider } from "@/components/HeroBannerProvider";
import { IndexBannerProvider } from "@/components/IndexBannerProvider";
import { PartnerBannerProvider } from "@/components/PartnerBannerProvider";
import { SocialChannelProvider } from "@/components/SocialChannelProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <IndexBannerProvider>
          <HeroBannerProvider>
            <PartnerBannerProvider>
              <SocialChannelProvider>{children}</SocialChannelProvider>
            </PartnerBannerProvider>
          </HeroBannerProvider>
        </IndexBannerProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

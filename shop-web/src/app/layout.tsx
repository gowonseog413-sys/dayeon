import type { Metadata } from "next";
import "./globals.css";
import { DocumentTitle } from "@/components/DocumentTitle";
import { EventPopupLayer } from "@/components/EventPopupLayer";
import { PartnerBannerRails } from "@/components/PartnerBannerRails";
import { Providers } from "@/components/Providers";
import { ThemeMotionLayer } from "@/components/ThemeMotionLayer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "dayeon — 쇼핑몰",
  description: "dayeon 컬러렌즈 · 렌즈 케어 쇼핑몰",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>
          <DocumentTitle />
          <SiteHeader />
          <div className="site-motion-scope relative">
            <ThemeMotionLayer />
            <main className="relative">{children}</main>
            <SiteFooter />
          </div>
          <EventPopupLayer />
          <PartnerBannerRails />
        </Providers>
      </body>
    </html>
  );
}

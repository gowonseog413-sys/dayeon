import type { Metadata } from "next";
import "./globals.css";
import { ChatFab } from "@/components/ChatFab";
import { DocumentTitle } from "@/components/DocumentTitle";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "dayeon — 쇼핑몰",
  description: "dayeon 콘택트렌즈 · 렌즈 케어 쇼핑몰",
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
          <main>{children}</main>
          <SiteFooter />
          <ChatFab />
        </Providers>
      </body>
    </html>
  );
}

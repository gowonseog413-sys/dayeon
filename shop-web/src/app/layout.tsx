import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ChatFab } from "@/components/ChatFab";

export const metadata: Metadata = {
  title: "EYESIGHT - 쇼핑몰 초안",
  description: "Eyesight 스타일 콘택트렌즈 쇼핑몰 1차 초안 (dayeon)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ChatFab />
      </body>
    </html>
  );
}

import { CmsContentPage } from "@/components/CmsContentPage";

export default function AboutPage() {
  return (
    <CmsContentPage
      kind="pages"
      pageKey="about"
      staticKey="about"
      sideImage={{
        src: "/brand/dayeon-about-mascot.png",
        alt: "dayeon",
        height: 280,
      }}
    />
  );
}

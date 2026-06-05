import { CmsContentPage } from "@/components/CmsContentPage";

export default function CareersPage() {
  return (
    <CmsContentPage
      kind="pages"
      pageKey="careers"
      staticKey="careers"
      sideImage={{
        src: "/brand/dayeon-careers-mascot.png",
        alt: "dayeon",
        height: 280,
      }}
    />
  );
}

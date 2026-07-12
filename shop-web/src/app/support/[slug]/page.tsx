import { CmsContentPage } from "@/components/CmsContentPage";
import type { StaticSupportKey } from "@/i18n/static-content";
import { notFound } from "next/navigation";

const SLUGS = ["faq", "shipping", "returns", "contact"] as const;

type Props = { params: Promise<{ slug: string }> };

export default async function SupportPage({ params }: Props) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) notFound();
  return (
    <CmsContentPage
      kind="support"
      pageKey={slug}
      staticSupportKey={slug as StaticSupportKey}
    />
  );
}

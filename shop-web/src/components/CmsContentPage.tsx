"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getStaticPage, type StaticPageKey } from "@/i18n/static-content";
import { CmsHtmlBody } from "@/components/CmsHtmlBody";
import { useI18n } from "@/components/I18nProvider";
import { useTheme } from "@/components/ThemeProvider";

type Section = { heading: string; paragraphs: string[] };
type PageData = { title: string; sections: Section[]; html?: string; email?: string };

type SideImage = {
  src: string;
  alt: string;
  height?: number;
};

type Props = {
  kind: "pages" | "support";
  pageKey: string;
  staticKey?: StaticPageKey;
  twoColumn?: boolean;
  /** 회사소개 등 — 본문 옆 장식 로고 */
  sideImage?: SideImage;
};

export function CmsContentPage({ kind, pageKey, staticKey, twoColumn, sideImage }: Props) {
  const { locale } = useI18n();
  const { theme } = useTheme();
  const showSideImage = sideImage && theme !== "clean";
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<{ page: PageData }>(`/api/content/${kind}/${pageKey}`)
      .then((d) => setPage(d.page))
      .catch(() => {
        if (staticKey && locale === "ko") {
          const s = getStaticPage(staticKey, "ko");
          setPage({ title: s.title, sections: s.sections });
        } else if (staticKey) {
          const s = getStaticPage(staticKey, locale);
          setPage({ title: s.title, sections: s.sections });
        } else {
          setPage(null);
        }
      })
      .finally(() => setLoading(false));
  }, [kind, pageKey, locale, staticKey]);

  if (loading) {
    return <p className="py-20 text-center text-sm text-gray-500">불러오는 중...</p>;
  }
  if (!page) {
    return <p className="py-20 text-center text-sm text-gray-500">내용을 찾을 수 없습니다.</p>;
  }

  if (page.html?.trim()) {
    return (
      <div className={`mx-auto px-4 py-12 ${showSideImage ? "max-w-5xl" : "max-w-3xl"}`}>
        <div
          className={
            showSideImage
              ? "grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12"
              : undefined
          }
        >
          <div>
            <h1 className="mb-10 text-3xl font-semibold">{page.title}</h1>
            {page.email && (
              <p className="mb-6 text-sm">
                <a href={`mailto:${page.email}`} className="text-[var(--pink-accent)]">
                  {page.email}
                </a>
              </p>
            )}
            <CmsHtmlBody html={page.html} />
          </div>
          {showSideImage && (
            <aside className="flex justify-center md:sticky md:top-28 md:justify-end">
              <Image
                src={sideImage.src}
                alt={sideImage.alt}
                width={400}
                height={400}
                unoptimized
                className="h-auto w-auto max-w-[min(100%,280px)] object-contain sm:max-w-[320px]"
                style={{ height: sideImage.height ?? 280, maxHeight: sideImage.height ?? 280 }}
              />
            </aside>
          )}
        </div>
      </div>
    );
  }

  const earn = twoColumn ? page.sections[0] : undefined;
  const use = twoColumn ? page.sections[1] : undefined;
  const rest = twoColumn ? page.sections.slice(2) : page.sections;

  if (twoColumn && earn && use) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-10 text-3xl font-semibold">{page.title}</h1>
        <div className="mb-10 grid gap-10 md:grid-cols-2">
          {[earn, use].map((s) => (
            <div key={s.heading}>
              <h2 className="mb-4 text-lg font-semibold">{s.heading}</h2>
              <Body sections={[s]} />
            </div>
          ))}
        </div>
        <Body sections={rest} />
      </div>
    );
  }

  const imgH = sideImage?.height ?? 280;

  return (
    <div className={`mx-auto px-4 py-12 ${showSideImage ? "max-w-5xl" : "max-w-3xl"}`}>
      <div
        className={
          showSideImage
            ? "grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12"
            : undefined
        }
      >
        <div>
          <h1 className="mb-10 text-3xl font-semibold">{page.title}</h1>
          {page.email && (
            <p className="mb-6 text-sm">
              <a href={`mailto:${page.email}`} className="text-[var(--pink-accent)]">
                {page.email}
              </a>
            </p>
          )}
          <Body sections={page.sections} />
        </div>
        {showSideImage && (
          <aside className="flex justify-center md:sticky md:top-28 md:justify-end">
            <Image
              src={sideImage.src}
              alt={sideImage.alt}
              width={400}
              height={400}
              unoptimized
              className="h-auto w-auto max-w-[min(100%,280px)] object-contain sm:max-w-[320px]"
              style={{ height: imgH, maxHeight: imgH }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function Body({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-8">
      {sections.map((s, i) => (
        <section key={`${s.heading}-${i}`}>
          {s.heading && <h2 className="mb-3 text-lg font-semibold">{s.heading}</h2>}
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

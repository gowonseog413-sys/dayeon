"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  emptyHeroSlide,
  HERO_BANNER_MAX,
  normalizeHeroBanners,
  type HeroBannerLinkType,
  type HeroBannerSlide,
} from "@/lib/hero-banners";
import { publishHeroBannersUpdate } from "@/lib/hero-banners-sync";
import type { Product } from "@/lib/types";

const HERO_BANNER_PAGE_SIZE = 2;

function SlideEditor({
  slide,
  index,
  products,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  slide: HeroBannerSlide;
  index: number;
  products: Product[];
  onChange: (patch: Partial<HeroBannerSlide>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { t, tFmt } = useI18n();
  const linkOptions = [
    ["none", "erp.theme.hero.linkNone"],
    ["url", "erp.theme.hero.linkUrl"],
    ["product", "erp.theme.hero.linkProduct"],
  ] as const;

  return (
    <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">
          {tFmt("erp.theme.hero.bannerN", { n: index + 1 })}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="rounded border px-2 py-1 disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="rounded border px-2 py-1 disabled:opacity-40"
          >
            ↓
          </button>
          <button type="button" onClick={onRemove} className="text-red-500 hover:underline">
            {t("erp.common.delete")}
          </button>
        </div>
      </div>

      <ErpImageUpload
        variant="hero"
        label={t("erp.theme.hero.imageLabel")}
        value={slide.image}
        onChange={(url) => onChange({ image: url })}
      />

      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-xs text-gray-600">{t("erp.theme.hero.altLabel")}</span>
        <input
          type="text"
          value={slide.alt}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder={t("erp.theme.hero.altPlaceholder")}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </label>

      <fieldset className="mt-3">
        <legend className="mb-2 text-xs font-medium text-gray-600">{t("erp.theme.hero.clickAction")}</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {linkOptions.map(([value, labelKey]) => (
            <label key={value} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name={`linkType-${slide.id}`}
                checked={slide.linkType === value}
                onChange={() =>
                  onChange({
                    linkType: value as HeroBannerLinkType,
                    url: value === "url" ? slide.url : "",
                    productId: value === "product" ? slide.productId : "",
                  })
                }
              />
              {t(labelKey)}
            </label>
          ))}
        </div>
      </fieldset>

      {slide.linkType === "url" && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-600">{t("erp.theme.hero.urlLabel")}</span>
            <input
              type="text"
              value={slide.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://example.com"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={slide.openInNewTab}
              onChange={(e) => onChange({ openInNewTab: e.target.checked })}
            />
            {t("erp.theme.hero.openNewTab")}
          </label>
        </div>
      )}

      {slide.linkType === "product" && (
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-xs text-gray-600">{t("erp.theme.hero.productLabel")}</span>
          <select
            value={slide.productId}
            onChange={(e) => onChange({ productId: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="">{t("erp.theme.hero.selectProduct")}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} — {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-gray-500">{t("erp.theme.hero.productHint")}</p>
        </label>
      )}
    </div>
  );
}

function ThemeHeroLoadingFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.themeHero">
      <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
    </ErpPageShell>
  );
}

function ErpHeroBannersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const { t, tFmt } = useI18n();

  const [slides, setSlides] = useState<HeroBannerSlide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [bannerData, productData] = await Promise.all([
        api<{ heroBanners: HeroBannerSlide[] }>("/api/admin/settings/hero-banners", {
          token: getErpToken(),
        }),
        api<{ products: Product[] }>("/api/admin/products", { token: getErpToken() }),
      ]);
      setSlides(normalizeHeroBanners(bannerData.heroBanners).map((s) => ({ ...s })));
      setProducts(productData.products);
    } catch {
      setSlides([]);
      setProducts([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateSlide(index: number, patch: Partial<HeroBannerSlide>) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSlide(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSlide(index: number, dir: -1 | 1) {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const total = slides.length;
  const totalPages = Math.max(1, Math.ceil(total / HERO_BANNER_PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);

  const pageSlides = useMemo(() => {
    const start = (page - 1) * HERO_BANNER_PAGE_SIZE;
    return slides.slice(start, start + HERO_BANNER_PAGE_SIZE).map((slide, i) => ({
      slide,
      index: start + i,
    }));
  }, [slides, page]);

  useEffect(() => {
    if (pageParam > totalPages && totalPages >= 1 && total > 0) {
      router.replace("/erp/theme/hero");
    }
  }, [pageParam, totalPages, total, router]);

  function addSlide() {
    if (slides.length >= HERO_BANNER_MAX) return;
    setSlides((prev) => [...prev, emptyHeroSlide()]);
    const nextTotal = slides.length + 1;
    const lastPage = Math.ceil(nextTotal / HERO_BANNER_PAGE_SIZE);
    if (lastPage > 1) {
      router.push(`/erp/theme/hero?page=${lastPage}`);
    }
  }

  async function save() {
    setLoading(true);
    setErrorMsg("");
    try {
      const payload = normalizeHeroBanners(slides.filter((s) => s.image.trim()));
      const data = await api<{ heroBanners: HeroBannerSlide[] }>(
        "/api/admin/settings/hero-banners",
        {
          method: "PATCH",
          token: getErpToken(),
          body: JSON.stringify({ heroBanners: payload }),
        },
      );
      const next = normalizeHeroBanners(data.heroBanners);
      setSlides(next.map((s) => ({ ...s })));
      publishHeroBannersUpdate(next);
      showSaveSuccess({
        subMessage: t("erp.theme.hero.savedSub"),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <ThemeHeroLoadingFallback />;
  }

  return (
    <ErpPageShell titleKey="erp.nav.themeHero" descriptionKey="erp.theme.hero.description">
      {errorMsg ? (
        <p
          className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700"
          aria-live="polite"
        >
          {errorMsg}
        </p>
      ) : null}

      <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
        <p>
          {tFmt("erp.theme.hero.hintMax", {
            max: HERO_BANNER_MAX,
            pageSize: HERO_BANNER_PAGE_SIZE,
          })}
        </p>
        <p>{t("erp.theme.hero.hintLinks")}</p>
        <p>{t("erp.theme.hero.hintCrop")}</p>
      </div>

      <div className="space-y-3">
        {slides.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-gray-500">
            {t("erp.theme.hero.noBanners")}
          </p>
        ) : (
          <>
            {pageSlides.map(({ slide, index }) => (
              <SlideEditor
                key={slide.id}
                slide={slide}
                index={index}
                products={products}
                onChange={(patch) => updateSlide(index, patch)}
                onRemove={() => removeSlide(index)}
                onMoveUp={() => moveSlide(index, -1)}
                onMoveDown={() => moveSlide(index, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < slides.length - 1}
              />
            ))}
            <NatePagination
              page={page}
              totalPages={totalPages}
              basePath="/erp/theme/hero"
              className="mt-4"
            />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <button
          type="button"
          disabled={slides.length >= HERO_BANNER_MAX}
          onClick={addSlide}
          className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)] disabled:opacity-50"
        >
          {t("erp.theme.hero.addBanner")}
        </button>
        <ErpFormActions>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t("erp.common.refresh")}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={save}
            className="rounded-lg bg-[#1e293b] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? t("erp.common.saving") : t("erp.common.save")}
          </button>
        </ErpFormActions>
      </div>
    </ErpPageShell>
  );
}

export default function ErpHeroBannersPage() {
  return (
    <Suspense fallback={<ThemeHeroLoadingFallback />}>
      <ErpHeroBannersContent />
    </Suspense>
  );
}

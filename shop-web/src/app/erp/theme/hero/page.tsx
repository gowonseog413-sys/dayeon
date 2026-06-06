"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
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
  return (
    <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">배너 {index + 1}</p>
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
            삭제
          </button>
        </div>
      </div>

      <ErpImageUpload
        variant="hero"
        label="히어로 배너 이미지 (21:7)"
        value={slide.image}
        onChange={(url) => onChange({ image: url })}
      />

      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-xs text-gray-600">대체 텍스트 (alt)</span>
        <input
          type="text"
          value={slide.alt}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="배너 설명"
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </label>

      <fieldset className="mt-3">
        <legend className="mb-2 text-xs font-medium text-gray-600">클릭 시 동작</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {(
            [
              ["none", "링크 없음"],
              ["url", "외부 URL"],
              ["product", "상품 페이지"],
            ] as const
          ).map(([value, label]) => (
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
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {slide.linkType === "url" && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-600">URL 주소</span>
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
            새 창에서 열기
          </label>
        </div>
      )}

      {slide.linkType === "product" && (
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-xs text-gray-600">연결 상품</span>
          <select
            value={slide.productId}
            onChange={(e) => onChange({ productId: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="">상품 선택</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} — {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-gray-500">같은 창에서 상품 상세 페이지로 이동합니다.</p>
        </label>
      )}
    </div>
  );
}

function ErpHeroBannersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

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
          token: getToken(),
        }),
        api<{ products: Product[] }>("/api/admin/products", { token: getToken() }),
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
          token: getToken(),
          body: JSON.stringify({ heroBanners: payload }),
        },
      );
      const next = normalizeHeroBanners(data.heroBanners);
      setSlides(next.map((s) => ({ ...s })));
      publishHeroBannersUpdate(next);
      showSaveSuccess({
        subMessage: "히어로 배너가 쇼핑몰 메인에 실시간 반영됩니다.",
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <ErpPageShell title="히어로배너">
        <p className="text-sm text-gray-500">불러오는 중…</p>
      </ErpPageShell>
    );
  }

  return (
    <ErpPageShell
      title="히어로배너"
      description="쇼핑몰 메인 상단 큰 캐러셀 배너를 관리합니다. 순서·이미지·클릭 링크(외부 URL 또는 상품)를 설정할 수 있습니다."
    >
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
          · 최대 {HERO_BANNER_MAX}장 · {HERO_BANNER_PAGE_SIZE}건씩 · ↑↓ 버튼으로 슬라이드 순서 변경
        </p>
        <p>· 외부 URL: 새 창/같은 창 선택 가능 · 상품: 쇼핑몰 상품 상세로 이동</p>
        <p>· 이미지는 21:7 비율로 자동 크롭·WebP 변환</p>
      </div>

      <div className="space-y-3">
        {slides.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-gray-500">
            등록된 배너가 없습니다. 아래에서 추가하세요.
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
          + 배너 추가
        </button>
        <ErpFormActions>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            새로고침
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={save}
            className="rounded-lg bg-[#1e293b] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "저장 중…" : "저장"}
          </button>
        </ErpFormActions>
      </div>
    </ErpPageShell>
  );
}

export default function ErpHeroBannersPage() {
  return (
    <Suspense
      fallback={
        <ErpPageShell title="히어로배너">
          <p className="text-sm text-gray-500">불러오는 중…</p>
        </ErpPageShell>
      }
    >
      <ErpHeroBannersContent />
    </Suspense>
  );
}

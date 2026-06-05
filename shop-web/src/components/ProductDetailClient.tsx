"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart-store";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { useAuth } from "@/hooks/useAuth";
import { ProductCarousel } from "@/components/ProductCarousel";
import { useI18n } from "@/components/I18nProvider";
import { getProductAccordionCopy } from "@/i18n/product-copy";
import type { Product, ProductReview, ReviewSummary } from "@/lib/types";

type Props = {
  product: Product;
  initialSummary: ReviewSummary;
};

type AccordionKey = "description" | "additional" | "shipping" | null;

function Stars({
  value,
  onChange,
  interactive,
  starLabel,
}: {
  value: number;
  onChange?: (n: number) => void;
  interactive?: boolean;
  starLabel: string;
}) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={`text-lg leading-none ${
            n <= value ? "text-[var(--pink-accent)]" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          aria-label={`${n} ${starLabel}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export function ProductDetailClient({ product, initialSummary }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { user, ready } = useAuth();
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const accordionCopy = getProductAccordionCopy(product, locale);
  const images =
    product.images?.length && product.images.length > 0
      ? product.images
      : [{ url: product.image, alt: product.name }];
  const colors = product.colors?.length
    ? product.colors
    : [{ id: "default", label: t("product.colorDefault"), swatch: product.colorSwatch }];
  const powers = product.powers ?? [];

  const [activeImage, setActiveImage] = useState(0);
  const [powerLeft, setPowerLeft] = useState("0.00");
  const [powerRight, setPowerRight] = useState("0.00");
  const [colorId, setColorId] = useState(colors[0].id);
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<AccordionKey>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState(initialSummary);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [related, setRelated] = useState<Product[]>([]);

  function loadReviews() {
    api<{ reviews: ProductReview[]; average: number; count: number }>(
      `/api/products/${product.id}/reviews`,
    )
      .then((d) => {
        setReviews(d.reviews);
        setSummary({ average: d.average, count: d.count });
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const scrollToReviewForm = useCallback(() => {
    requestAnimationFrame(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  function openReviewComposer() {
    if (!ready) return;
    if (!user) {
      router.push(`/login?next=/product/${product.id}#product-reviews`);
      return;
    }
    setShowReviewForm(true);
    scrollToReviewForm();
  }

  useEffect(() => {
    if (showReviewForm && user) scrollToReviewForm();
  }, [showReviewForm, user, scrollToReviewForm]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#product-reviews" && user) {
      setShowReviewForm(true);
    }
  }, [user, product.id]);

  useEffect(() => {
    api<{ products: Product[] }>(`/api/products?section=${product.section}`)
      .then((d) =>
        setRelated(d.products.filter((p) => p.id !== product.id).slice(0, 8)),
      )
      .catch(() => setRelated([]));
  }, [product.id, product.section]);

  function toggleSection(key: AccordionKey) {
    setOpenSection((prev) => (prev === key ? null : key));
  }

  function addBag(andCheckout = false) {
    addToCart(product.id, qty);
    if (andCheckout) router.push("/checkout");
    else alert(t("product.addedBag"));
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewMsg("");
    const token = getToken();
    if (!token) {
      router.push(`/login?next=/product/${product.id}`);
      return;
    }
    try {
      await api(`/api/products/${product.id}/reviews`, {
        method: "POST",
        token,
        body: JSON.stringify({ rating: reviewRating, content: reviewText }),
      });
      setReviewText("");
      setShowReviewForm(false);
      setReviewMsg(t("product.reviewThanks"));
      loadReviews();
    } catch (err) {
      setReviewMsg(err instanceof Error ? err.message : t("product.reviewFail"));
    }
  }

  const selectedColor = colors.find((c) => c.id === colorId) ?? colors[0];

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* 갤러리 */}
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col gap-2">
            {images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 overflow-hidden rounded border-2 bg-gray-50 transition ${
                  activeImage === i
                    ? "border-[var(--pink-accent)]"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <Image
                  src={i === 0 ? product.image : img.url}
                  alt={img.alt}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                />
                {i === 0 && product.badge && (
                  <span className="absolute left-0 top-0 bg-[var(--pink-accent)] px-1 text-[9px] font-bold text-white">
                    {product.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-lg bg-gray-50 md:min-h-[480px]">
            <Image
              src={
                activeImage === 0
                  ? product.image
                  : images[activeImage]?.url ?? product.image
              }
              alt={images[activeImage]?.alt ?? product.name}
              fill
              unoptimized
              className="object-cover"
              priority
              sizes="(max-width:768px) 100vw, 55vw"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.includes("/placeholders/")) {
                  el.src = product.image.includes("bundle")
                    ? "/placeholders/bundle.svg"
                    : "/placeholders/lens-gray.svg";
                }
              }}
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-[var(--pink-accent)] px-3 py-1 text-xs font-bold text-white">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div>
          <p className="text-sm font-semibold">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-2 text-sm">
            <span className="text-gray-500">{t("product.recommended")}</span>
            <span className="text-gray-400 line-through">{formatRp(product.priceOriginal)}</span>
            <span className="text-gray-500">{t("product.billed")}</span>
            <span className="text-xl font-semibold text-[var(--pink-accent)]">
              {formatRp(product.priceSale)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Stars value={Math.round(summary.average) || 0} starLabel={t("product.star")} />
            {summary.count > 0 && (
              <span className="text-xs text-gray-500">
                ({summary.count} {t("product.reviews")})
              </span>
            )}
            <button
              type="button"
              onClick={openReviewComposer}
              className="text-sm text-[var(--pink-accent)] underline-offset-2 hover:underline"
            >
              {t("product.writeReview")}
            </button>
          </div>

          {powers.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">{t("product.power")}</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-gray-500">
                  {t("product.left")}
                  <select
                    value={powerLeft}
                    onChange={(e) => setPowerLeft(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                  >
                    {powers.map((p) => (
                      <option key={`l-${p}`} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-gray-500">
                  {t("product.right")}
                  <select
                    value={powerRight}
                    onChange={(e) => setPowerRight(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                  >
                    {powers.map((p) => (
                      <option key={`r-${p}`} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">{t("product.color")}</p>
            <div className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-full border border-gray-200"
                style={{ background: selectedColor.swatch }}
              />
              <select
                value={colorId}
                onChange={(e) => setColorId(e.target.value)}
                className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
              >
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium">{t("product.qty")}</span>
            <div className="flex items-center rounded border border-gray-200">
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label={t("product.qtyDec")}
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm">{qty}</span>
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() => setQty((q) => q + 1)}
                aria-label={t("product.qtyInc")}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => addBag(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded border border-gray-800 py-3 text-sm font-medium hover:bg-gray-50"
            >
              <span className="text-[var(--pink-accent)]">+</span> {t("product.addBag")}
            </button>
            <button
              type="button"
              onClick={() => addBag(true)}
              className="flex-1 rounded bg-[var(--pink-accent)] py-3 text-sm font-medium text-white hover:opacity-90"
            >
              {t("product.buyNow")}
            </button>
          </div>

          <Link
            href="/profile/wishlist"
            className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--pink-accent)]"
          >
            ♥ {t("product.wishlist")}
          </Link>

          <div className="mt-8 border-t border-gray-200">
            {(
              [
                { key: "description" as const, label: t("product.desc"), body: accordionCopy.description },
                { key: "additional" as const, label: t("product.additional"), body: accordionCopy.additional },
                { key: "shipping" as const, label: t("product.shipping"), body: accordionCopy.shipping },
              ] as const
            ).map((sec) => (
              <div key={sec.key} className="border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleSection(sec.key)}
                  className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
                >
                  {sec.label}
                  <span
                    className={`text-gray-400 transition ${openSection === sec.key ? "rotate-180" : ""}`}
                  >
                    ∨
                  </span>
                </button>
                {openSection === sec.key && sec.body && (
                  <div className="pb-4 text-sm leading-relaxed whitespace-pre-line text-gray-600">
                    {sec.body}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="mt-8 inline-block text-sm text-gray-500 hover:text-[var(--pink-accent)]"
          >
            ← {t("product.continueShop")}
          </Link>
        </div>
      </div>

      {/* 리뷰 */}
      <section id="product-reviews" className="scroll-mt-24 bg-[var(--pink-bg)] py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-xl font-semibold">{t("product.reviewTitle")}</h2>

          <div ref={reviewFormRef} className="mb-8">
            {!ready ? (
              <p className="text-sm text-gray-500">...</p>
            ) : !user ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
                <p>{t("product.reviewLoginRequired")}</p>
                <Link
                  href={`/login?next=/product/${product.id}#product-reviews`}
                  className="mt-2 inline-block font-medium text-[var(--pink-accent)] hover:underline"
                >
                  {t("product.reviewLoginLink")}
                </Link>
              </div>
            ) : showReviewForm ? (
              <form
                id="product-review-form"
                onSubmit={submitReview}
                className="rounded-xl border border-[var(--pink-accent)] bg-white p-5 shadow-sm"
              >
                <p className="mb-3 font-medium">{t("product.writeReview")}</p>
                <Stars
                  value={reviewRating}
                  onChange={setReviewRating}
                  interactive
                  starLabel={t("product.star")}
                />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t("product.reviewPlaceholder")}
                  rows={4}
                  className="mt-3 w-full rounded border border-gray-200 bg-[var(--pink-bg)]/30 p-3 text-sm"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">{t("product.reviewPurchaseNote")}</p>
                {reviewMsg && <p className="mt-2 text-sm text-green-700">{reviewMsg}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
                  >
                    {t("product.reviewSubmit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewMsg("");
                    }}
                    className="rounded-full border px-5 py-2 text-sm"
                  >
                    {t("product.reviewCancel")}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={openReviewComposer}
                className="rounded-full border border-[var(--pink-accent)] bg-white px-5 py-2 text-sm text-[var(--pink-accent)] hover:bg-white/80"
              >
                {t("product.writeReview")}
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-600">{t("product.reviewEmpty")}</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--pink-accent)] text-sm font-bold text-white">
                      {r.userName.charAt(0)}
                    </span>
                    <div>
                      <p className="font-medium">{r.userName}</p>
                      <Stars value={r.rating} starLabel={t("product.star")} />
                    </div>
                    <time className="ml-auto text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString(
                        locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR",
                      )}
                    </time>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">{r.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <ProductCarousel title={t("product.related")} products={related} visibleCount={3} />
      )}
    </>
  );
}

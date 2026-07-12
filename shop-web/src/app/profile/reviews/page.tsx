"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { localizeReviewContent } from "@/i18n/review-content";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { useReviewReward } from "@/hooks/useReviewReward";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { ProductReview, ReviewableItem } from "@/lib/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-[var(--pink-accent)]">
      {"★".repeat(value)}
      <span className="text-gray-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function ProfileReviewsPage() {
  const { t, tFmt, locale } = useI18n();
  const { reviewReward } = useReviewReward();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewable, setReviewable] = useState<ReviewableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ reviews: ProductReview[]; reviewable: ReviewableItem[] }>("/api/reviews/mine", {
      token: getToken(),
    })
      .then((d) => {
        setReviews(d.reviews);
        setReviewable(d.reviewable);
      })
      .catch(() => {
        setReviews([]);
        setReviewable([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">{t("common.loading")}</p>;
  }

  const empty = reviews.length === 0 && reviewable.length === 0;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">{t("profile.title.reviews")}</h1>
      <div className="mb-6 text-sm text-gray-500">
        <p>{t("profile.reviews.deliveredOnly")}</p>
        {reviewReward.enabled && reviewReward.points > 0 ? (
          <p className="mt-1 font-medium text-[var(--pink-deep)]">
            {tFmt("profile.reviews.reward", { points: String(reviewReward.points) })}
          </p>
        ) : null}
      </div>

      {reviewable.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">{t("profile.reviews.pending")}</h2>
          <ul className="space-y-3">
            {reviewable.map((item) => (
              <li
                key={item.productId}
                className="flex items-center gap-3 rounded-xl border bg-white p-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                  <Image
                    src={
                      item.image ||
                      productImageFallback({ category: "", image: item.image || "" })
                    }
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">{item.brand}</p>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {item.orderNumber || item.orderId.slice(0, 8)} · {t("profile.reviews.delivered")}
                  </p>
                </div>
                <Link
                  href={`/product/${item.productId}#product-reviews`}
                  className="shrink-0 rounded-full bg-[var(--pink-accent)] px-4 py-2 text-xs text-white"
                >
                  {t("profile.reviews.write")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {reviews.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">{t("profile.reviews.written")}</h2>
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-4">
                <div className="flex gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                    <Image
                      src={
                        r.productImage ||
                        productImageFallback({ category: "", image: r.productImage || "" })
                      }
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${r.productId}`}
                      className="text-sm font-medium hover:text-[var(--pink-accent)]"
                    >
                      {r.productBrand} {r.productName}
                    </Link>
                    <div className="mt-1">
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {localizeReviewContent(r.content, locale)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleString(
                        locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR",
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {empty && (
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">{t("profile.reviews.empty")}</p>
          <p className="mt-2 text-sm">{t("profile.reviews.emptyHint")}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border border-gray-300 px-6 py-2 text-sm"
          >
            {t("profile.backToShop")}
          </Link>
        </div>
      )}
    </div>
  );
}

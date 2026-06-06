"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { NatePagination } from "@/components/NatePagination";
import { WishlistHeartButton } from "@/components/WishlistHeartButton";
import { api, formatRp } from "@/lib/api";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { Product, WishlistItem } from "@/lib/types";
import {
  getWishlist,
  removeFromWishlist,
  WISHLIST_UPDATED_EVENT,
} from "@/lib/wishlist-store";
import {
  buildWishlistShareText,
  copyShareText,
  nativeShare,
  shareFacebook,
  shareLine,
  shareTelegram,
  shareWhatsApp,
} from "@/lib/wishlist-share";

const PAGE_SIZE = 5;

type WishlistRow = WishlistItem & { product: Product };

type Props = {
  page: number;
  onPageChange: (page: number) => void;
};

export function ProfileWishlistPanel({ page, onPageChange }: Props) {
  const { t, tFmt } = useI18n();
  const [rows, setRows] = useState<WishlistRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [shareMsg, setShareMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const wishlist = getWishlist();
    if (!wishlist.length) {
      setRows([]);
      setSelected(new Set());
      setLoading(false);
      return;
    }
    try {
      const { products } = await api<{ products: Product[] }>("/api/products");
      const map = new Map(products.map((p) => [p.id, p]));
      const nextRows = wishlist
        .map((w) => {
          const product = map.get(w.productId);
          return product ? { ...w, product } : null;
        })
        .filter(Boolean) as WishlistRow[];
      setRows(nextRows);
      setSelected(new Set(nextRows.map((r) => r.productId)));
    } catch {
      setRows([]);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener(WISHLIST_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, onUpdate);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.productId)),
    [rows, selected],
  );

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleItem(productId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
    setShareMsg("");
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.productId)));
    }
    setShareMsg("");
  }

  async function handleShare(channel: "whatsapp" | "line" | "facebook" | "telegram" | "copy" | "native") {
    if (!selectedRows.length) {
      setShareMsg(t("wishlist.shareNone"));
      return;
    }
    const text = buildWishlistShareText(selectedRows);
    const url = `${window.location.origin}/profile/wishlist?tab=wishlist`;

    if (channel === "whatsapp") shareWhatsApp(text);
    else if (channel === "line") shareLine(text);
    else if (channel === "facebook") shareFacebook(url, text);
    else if (channel === "telegram") shareTelegram(url, text.slice(0, 200));
    else if (channel === "copy") {
      const ok = await copyShareText(text);
      setShareMsg(ok ? t("wishlist.shareCopied") : t("wishlist.shareCopyFail"));
      return;
    } else if (channel === "native") {
      const ok = await nativeShare("dayeon wishlist", text, url);
      if (!ok) setShareMsg(t("wishlist.shareUnsupported"));
      return;
    }
    setShareMsg("");
  }

  if (loading) {
    return <p className="text-sm text-gray-500">{t("common.loading")}</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-8 text-center shadow-[0_4px_18px_var(--pink-shadow)]">
        <p className="text-lg font-medium text-gray-700">{t("wishlist.empty")}</p>
        <p className="mt-2 text-sm text-gray-500">{t("wishlist.emptyHint")}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border-2 border-[var(--pink-border)] px-6 py-2 text-sm hover:border-[var(--pink-accent)]"
        >
          {t("wishlist.backShop")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <p className="text-xs text-gray-500">{tFmt("wishlist.count", { n: rows.length })}</p>
      </div>

      <div className="mb-6 rounded-2xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--pink-deep)]">{t("wishlist.shareTitle")}</p>
          <p className="text-xs font-medium text-[var(--pink-accent)]">
            {tFmt("wishlist.selectedCount", { n: selectedRows.length })}
          </p>
        </div>
        <p className="mt-1 text-xs text-gray-600">{t("wishlist.shareDesc")}</p>
        <button
          type="button"
          onClick={toggleAll}
          className="mt-2 text-xs text-gray-600 underline-offset-2 hover:text-[var(--pink-accent)] hover:underline"
        >
          {allSelected ? "☑ " : "ㅁ "}
          {t("wishlist.selectAll")}
        </button>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => handleShare("whatsapp")}
            className="rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            WhatsApp
          </button>
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => handleShare("line")}
            className="rounded-full bg-[#06C755] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            LINE
          </button>
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => handleShare("facebook")}
            className="rounded-full bg-[#1877F2] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            Facebook
          </button>
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => handleShare("telegram")}
            className="rounded-full bg-[#229ED9] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            Telegram
          </button>
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => handleShare("copy")}
            className="rounded-full border-2 border-[var(--pink-border)] bg-white px-4 py-2 text-xs font-medium text-gray-700 disabled:opacity-40"
          >
            {t("wishlist.copyText")}
          </button>
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => handleShare("native")}
            className="rounded-full border-2 border-[var(--pink-accent)] px-4 py-2 text-xs font-medium text-[var(--pink-accent)] disabled:opacity-40"
          >
            {t("wishlist.moreShare")}
          </button>
        </div>
        {shareMsg && <p className="mt-2 text-xs text-[var(--pink-accent)]">{shareMsg}</p>}
      </div>

      <ul className="space-y-4">
        {pageRows.map((row, i) => {
          const no = rows.length - ((safePage - 1) * PAGE_SIZE + i);
          const img = row.product.image || productImageFallback(row.product);
          const checked = selected.has(row.productId);
          return (
            <li
              key={row.id}
              className={`flex gap-3 rounded-2xl border-2 bg-white p-4 shadow-[0_4px_18px_var(--pink-shadow)] sm:gap-4 ${
                checked
                  ? "border-[var(--pink-accent)]/60"
                  : "border-[var(--pink-border)] opacity-90"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(row.productId)}
                className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 text-sm font-bold transition ${
                  checked
                    ? "border-[var(--pink-accent)] bg-[var(--pink-accent)] text-white"
                    : "border-[var(--pink-border)] bg-white text-[var(--pink-deep)] hover:border-[var(--pink-accent)]"
                }`}
                aria-pressed={checked}
                aria-label={checked ? "공유 선택 해제" : "공유 선택"}
              >
                {checked ? "✓" : "ㅁ"}
              </button>
              <span className="mt-1 text-xs font-semibold text-gray-400">No.{no}</span>
              <Link
                href={`/product/${row.product.id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">{row.product.brand}</p>
                <Link
                  href={`/product/${row.product.id}`}
                  className="font-semibold text-gray-900 hover:text-[var(--pink-accent)]"
                >
                  {row.product.name}
                </Link>
                <p className="mt-1 text-sm text-gray-400 line-through">
                  {formatRp(row.product.priceOriginal)}
                </p>
                <p className="text-base font-semibold text-[var(--pink-accent)]">
                  {formatRp(row.product.priceSale)}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {new Date(row.savedAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <WishlistHeartButton productId={row.productId} size="md" />
                <button
                  type="button"
                  onClick={() => removeFromWishlist(row.productId)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  {t("wishlist.remove")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <NatePagination
        page={safePage}
        totalPages={totalPages}
        basePath="/profile/wishlist"
        query="tab=wishlist"
        onPageChange={onPageChange}
        className="mt-6"
      />

      <p className="mt-6 text-center text-xs text-gray-400">{t("wishlist.noCheckout")}</p>
    </div>
  );
}

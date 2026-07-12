"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import {
  uploadErpImageFile,
  type ErpImageVariant,
} from "@/lib/erp-image-upload";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  variant?: ErpImageVariant;
};

function fileFromDataTransfer(dt: DataTransfer): File | null {
  if (dt.files?.length) {
    for (let i = 0; i < dt.files.length; i++) {
      const f = dt.files[i];
      if (f.type.startsWith("image/")) return f;
    }
  }
  if (dt.items?.length) {
    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (f) return f;
      }
    }
  }
  return null;
}

async function fileFromDragUrl(dt: DataTransfer): Promise<File | null> {
  const uri =
    dt.getData("text/uri-list")?.split("\n").find((line) => line && !line.startsWith("#"))?.trim() ||
    dt.getData("URL")?.trim() ||
    dt.getData("text/plain")?.trim();

  const html = dt.getData("text/html");
  const srcMatch = html?.match(/src=["']([^"']+)["']/i);
  const url = uri || srcMatch?.[1];
  if (!url) return null;
  if (!/^https?:\/\//i.test(url) && !url.startsWith("data:image/") && !url.startsWith("/")) {
    return null;
  }

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    const ext = blob.type.split("/")[1] || "webp";
    return new File([blob], `dropped.${ext}`, { type: blob.type });
  } catch {
    return null;
  }
}

async function resolveDroppedFile(dt: DataTransfer): Promise<File | null> {
  const direct = fileFromDataTransfer(dt);
  if (direct) return direct;
  return fileFromDragUrl(dt);
}

export function ErpImageUpload({
  value,
  onChange,
  label,
  variant = "main",
}: Props) {
  const { t } = useI18n();
  const displayLabel = label ?? t("erp.image.defaultLabel");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [err, setErr] = useState("");
  const dragDepthRef = useRef(0);
  const zoneRef = useRef<HTMLDivElement>(null);

  const isMain = variant === "main";
  const isPartner = variant === "partner";
  const isHero = variant === "hero";

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErr(t("erp.image.imagesOnly"));
        return;
      }
      setErr("");
      setUploading(true);
      try {
        const url = await uploadErpImageFile(file, variant);
        onChange(url);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : t("erp.image.uploadFailed"));
      } finally {
        setUploading(false);
      }
    },
    [onChange, variant, t],
  );

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    if (!uploading) {
      e.dataTransfer.dropEffect = "copy";
      setDragging(true);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    e.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const related = e.relatedTarget as Node | null;
    if (related && zoneRef.current?.contains(related)) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragging(false);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragging(false);
    if (uploading) return;

    const file = await resolveDroppedFile(e.dataTransfer);
    if (file) {
      await processFile(file);
      return;
    }
    setErr(t("erp.image.dropError"));
  }

  const previewClass = isMain
    ? "relative h-44 w-full overflow-hidden rounded-lg bg-gray-50"
    : isHero
      ? "relative mx-auto aspect-[21/7] w-full max-w-2xl overflow-hidden rounded-lg bg-gray-50"
      : isPartner
        ? "relative mx-auto aspect-square w-full max-w-[11rem] overflow-hidden rounded-lg bg-gray-50"
        : "relative mx-auto h-20 w-20 overflow-hidden rounded-lg bg-gray-50";

  return (
    <div className="space-y-2">
      <p className={`font-medium text-gray-700 ${isMain ? "text-sm" : "text-xs"}`}>{displayLabel}</p>

      <div
        ref={zoneRef}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed p-2 transition-colors ${
          dragging
            ? "border-[var(--pink-accent)] bg-pink-50/70 shadow-[inset_0_0_0_2px_rgba(233,30,140,0.15)]"
            : "border-gray-200 bg-white/60 hover:border-gray-300"
        }`}
      >
        <div className={`${previewClass} pointer-events-none select-none`}>
          {value ? (
            <Image src={value} alt="" fill className="object-cover" draggable={false} unoptimized />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-xs text-gray-400">
              <span>{uploading ? t("erp.image.uploading") : t("erp.image.dropHint1")}</span>
              {!uploading && <span>{t("erp.image.dropHint2")}</span>}
            </div>
          )}
          {dragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-pink-100/80 text-sm font-semibold text-[var(--pink-accent)]">
              {t("erp.image.dropHere")}
            </div>
          )}
        </div>

        <label className="mt-2 block cursor-pointer">
          <span className="sr-only">{t("erp.image.fileSelectSr")}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            disabled={uploading}
            className="block w-full text-xs text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs"
          />
        </label>
      </div>

      <p className="text-[10px] text-gray-400">
        {isPartner
          ? t("erp.image.hintPartner")
          : isHero
            ? t("erp.image.hintHero")
            : t("erp.image.hintDefault")}
      </p>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

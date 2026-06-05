"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
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

export function ErpImageUpload({
  value,
  onChange,
  label = "이미지",
  variant = "main",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [err, setErr] = useState("");

  const isMain = variant === "main";

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErr("이미지 파일만 선택할 수 있습니다.");
        return;
      }
      setErr("");
      setUploading(true);
      try {
        const url = await uploadErpImageFile(file, variant);
        onChange(url);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "업로드 실패");
      } finally {
        setUploading(false);
      }
    },
    [onChange, variant],
  );

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }

  const previewClass = isMain
    ? "relative h-44 w-full overflow-hidden rounded-lg border-2 border-dashed bg-gray-50"
    : "relative mx-auto h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed bg-gray-50";

  return (
    <div className="space-y-2">
      <p className={`font-medium text-gray-700 ${isMain ? "text-sm" : "text-xs"}`}>{label}</p>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`${previewClass} transition-colors ${
          dragging
            ? "border-[var(--pink-accent)] bg-pink-50/60"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {value ? (
          <Image src={value} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-xs text-gray-400">
            <span>{uploading ? "업로드 중…" : "이미지를 끌어다 놓거나"}</span>
            {!uploading && <span>파일을 선택하세요</span>}
          </div>
        )}
        {dragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-pink-100/70 text-sm font-medium text-[var(--pink-accent)]">
            여기에 놓기
          </div>
        )}
      </div>

      <label className="block">
        <span className="sr-only">파일 선택</span>
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          disabled={uploading}
          className="block w-full text-xs text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs"
        />
      </label>

      <p className="text-[10px] text-gray-400">업로드 시 WebP로 자동 변환·압축됩니다.</p>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

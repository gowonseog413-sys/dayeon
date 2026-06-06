import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

export type ErpImageVariant = "main" | "thumb" | "partner" | "hero";

const HERO_ASPECT = 21 / 7;

const VARIANT_OPTS: Record<
  ErpImageVariant,
  { maxWidth: number; maxHeight: number; quality: number; square?: boolean; wide?: boolean }
> = {
  main: { maxWidth: 1200, maxHeight: 1200, quality: 0.82 },
  thumb: { maxWidth: 360, maxHeight: 360, quality: 0.78 },
  /** 제휴 배너 — 중앙 정사각형 크롭 후 WebP */
  partner: { maxWidth: 270, maxHeight: 270, quality: 0.82, square: true },
  /** 히어로 배너 — 21:7 와이드 크롭 후 WebP */
  hero: { maxWidth: 1400, maxHeight: 467, quality: 0.85, wide: true },
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없습니다."));
    };
    img.src = url;
  });
}

/** 브라우저에서 WebP로 리사이즈·압축 후 data URL 반환 */
export async function convertImageToWebp(
  file: File,
  variant: ErpImageVariant = "main",
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const opts = VARIANT_OPTS[variant];
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지 변환에 실패했습니다.");

  if (opts.square) {
    const out = Math.min(opts.maxWidth, opts.maxHeight);
    const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - srcSize) / 2;
    const sy = (img.naturalHeight - srcSize) / 2;
    canvas.width = out;
    canvas.height = out;
    ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, out, out);
  } else if (opts.wide) {
    const targetAspect = HERO_ASPECT;
    const srcAspect = img.naturalWidth / img.naturalHeight;
    let sw;
    let sh;
    let sx;
    let sy;
    if (srcAspect > targetAspect) {
      sh = img.naturalHeight;
      sw = sh * targetAspect;
      sx = (img.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / targetAspect;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }
    canvas.width = opts.maxWidth;
    canvas.height = Math.round(opts.maxWidth / targetAspect);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  } else {
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height, 1);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
  }

  const dataUrl = canvas.toDataURL("image/webp", opts.quality);
  if (!dataUrl.startsWith("data:image/webp")) {
    throw new Error("WebP 변환을 지원하지 않는 브라우저입니다.");
  }
  return dataUrl;
}

export async function uploadErpImageFile(
  file: File,
  variant: ErpImageVariant = "main",
): Promise<string> {
  const dataUrl = await convertImageToWebp(file, variant);
  const base = file.name.replace(/\.[^.]+$/, "") || "upload";
  const res = await api<{ url: string }>("/api/admin/upload", {
    method: "POST",
    token: getToken(),
    body: JSON.stringify({ dataUrl, filename: `${base}.webp` }),
  });
  return res.url;
}

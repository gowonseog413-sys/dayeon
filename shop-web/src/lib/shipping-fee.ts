import { formatRp } from "@/lib/api";
import type { Product } from "@/lib/types";

export function productShippingFee(
  product: Pick<Product, "shippingFeeCharged" | "shippingFeeAmount">,
): number {
  if (!product.shippingFeeCharged) return 0;
  return Math.max(0, Number(product.shippingFeeAmount) || 0);
}

export function calcCartShippingFee(
  lines: { product: Product; quantity?: number }[],
): number {
  let max = 0;
  for (const line of lines) {
    const fee = productShippingFee(line.product);
    if (fee > max) max = fee;
  }
  return max;
}

export function formatOrderShippingLabel(fee: number | null | undefined): string {
  if (fee == null || fee === 0) return "배송비 무료";
  return formatRp(fee);
}

export function productShippingLabel(
  product: Pick<Product, "shippingFeeCharged" | "shippingFeeAmount">,
): string {
  return formatOrderShippingLabel(productShippingFee(product));
}

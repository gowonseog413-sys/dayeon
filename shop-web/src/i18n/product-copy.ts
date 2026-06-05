import type { Product } from "@/lib/types";
import type { Locale } from "./messages";
import { PRODUCT_COPY, PRODUCT_COPY_GENERIC } from "./product-content";

export function getProductAccordionCopy(
  product: Product,
  locale: Locale,
): { description: string; additional: string; shipping: string } {
  if (locale === "ko") {
    return {
      description:
        product.detailDescription ?? PRODUCT_COPY_GENERIC.ko.description,
      additional: product.additionalInfo ?? PRODUCT_COPY_GENERIC.ko.additional,
      shipping: product.shippingInfo ?? PRODUCT_COPY_GENERIC.ko.shipping,
    };
  }
  const isLens =
    product.category === "contact-lenses" ||
    Boolean(product.detailDescription?.includes("직경") || product.detailDescription?.includes("Diameter"));
  const pack = isLens ? PRODUCT_COPY[locale] : PRODUCT_COPY_GENERIC[locale];
  return pack;
}

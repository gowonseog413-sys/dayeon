import type { Product } from "@/lib/types";

export function productImageFallback(product: Pick<Product, "category" | "image">): string {
  if (product.image?.includes("bundle")) return "/placeholders/bundle.svg";
  if (product.category === "solutions") return "/placeholders/solution.svg";
  if (product.category === "accessories") return "/placeholders/accessory.svg";
  if (product.category === "bundles") return "/placeholders/bundle.svg";
  return "/placeholders/lens-gray.svg";
}

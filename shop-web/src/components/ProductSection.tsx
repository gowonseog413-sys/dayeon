import { CuteSectionTitle } from "@/components/CuteSectionTitle";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  title: string;
  products: Product[];
  variant?: "compact" | "tall";
  pinkBg?: boolean;
};

export function ProductSection({
  title,
  products,
  variant = "compact",
  pinkBg = false,
}: Props) {
  if (!products.length) return null;

  return (
    <section className={`py-10 ${pinkBg ? "bg-[var(--pink-bg)]/60" : ""}`}>
      <CuteSectionTitle title={title} />
      <div
        className={`mx-auto grid max-w-6xl gap-5 px-4 ${
          variant === "tall"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        }`}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} variant={variant} />
        ))}
      </div>
    </section>
  );
}

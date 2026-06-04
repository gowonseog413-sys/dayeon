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
    <section className={`py-10 ${pinkBg ? "bg-[var(--pink-bg)]" : ""}`}>
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-wide">{title}</h2>
      <div
        className={`mx-auto grid max-w-6xl gap-4 px-4 ${
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

import { notFound } from "next/navigation";
import { products } from "@/data/catalog";
import { SmartImage } from "@/components/smart-image";
import { SiteShell } from "@/components/site-shell";
import { ProductPurchase } from "@/components/product-purchase";
import { SaladBuilder } from "@/components/salad-builder";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) notFound();
  return (
    <SiteShell>
      {product.id === "build-salad" ? (
        <SaladBuilder />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SmartImage src={product.image} alt={product.nameAr} width={1200} height={900} className="w-full rounded-[32px] object-cover shadow-soft" />
          <ProductPurchase product={product} />
        </div>
      )}
    </SiteShell>
  );
}

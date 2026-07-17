import { notFound } from "next/navigation";
import { SmartImage } from "@/components/smart-image";
import { SiteShell } from "@/components/site-shell";
import { ProductPurchase } from "@/components/product-purchase";
import { SaladBuilder } from "@/components/salad-builder";
import { getPublicCatalog } from "@/lib/catalog/public";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const catalog = await getPublicCatalog();
  const product = catalog.products.find((item) => item.slug === slug && !item.deletedAt);

  if (!product) notFound();

  return (
    <SiteShell>
      {product.productType === "build_your_own" ? (
        <SaladBuilder />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-soft">
            <SmartImage src={product.images[0]?.path || "/images/products/product-fallback.jpg"} alt={product.nameAr} width={1200} height={900} priority sizes="(max-width: 1024px) 100vw, 56vw" className="h-full min-h-[320px] w-full" />
          </div>
          <ProductPurchase product={product} catalog={catalog} />
        </div>
      )}
    </SiteShell>
  );
}

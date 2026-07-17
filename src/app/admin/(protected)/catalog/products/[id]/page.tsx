import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { readCatalog } from "@/lib/catalog/storage";
import { CatalogManager } from "@/components/catalog-manager";

export default async function EditCatalogProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id) || null;
  if (!product) notFound();
  return <CatalogManager catalog={catalog} mode="product" product={product} />;
}


import { requireAdmin } from "@/lib/admin/session";
import { readCatalog } from "@/lib/catalog/storage";
import { CatalogManager } from "@/components/catalog-manager";

export default async function AdminCatalogIngredientsPage() {
  await requireAdmin();
  const catalog = await readCatalog();
  return <CatalogManager catalog={catalog} mode="ingredients" />;
}


import fs from "node:fs/promises";
import path from "node:path";
import { defaultCatalogData } from "../src/lib/catalog/defaults";
import { catalogSchema } from "../src/lib/catalog/validation";
import { normalizeCatalog, now } from "../src/lib/catalog/helpers";
import type { CatalogData } from "../src/types/catalog";

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");
const BACKUP_PATH = `${CATALOG_PATH}.migration-backup-${Date.now()}`;

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const force = process.argv.includes("--force");
  const exists = await fs
    .access(CATALOG_PATH)
    .then(() => true)
    .catch(() => false);

  if (exists && !force) {
    console.log(JSON.stringify({ status: "skipped", reason: "catalog-exists", file: CATALOG_PATH }, null, 2));
    return;
  }

  const existing: CatalogData = normalizeCatalog(defaultCatalogData);
  let previous: unknown = null;
  if (exists) {
    previous = JSON.parse(await fs.readFile(CATALOG_PATH, "utf8"));
    await fs.copyFile(CATALOG_PATH, BACKUP_PATH);
  }

  const migrated = catalogSchema.parse(existing);
  await fs.writeFile(CATALOG_PATH, `${JSON.stringify(migrated, null, 2)}\n`, "utf8");

  const report = {
    status: "ok",
    createdAt: now(),
    products: migrated.products.length,
    categories: migrated.categories.length,
    modifiers: migrated.modifiers.length,
    ingredients: migrated.ingredients.length,
    backup: exists ? BACKUP_PATH : null,
    previousHash: previous ? "present" : null,
  };

  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});


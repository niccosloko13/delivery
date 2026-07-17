import fs from "node:fs";
import path from "node:path";
import { buildWhatsAppMessage } from "../src/lib/orders";
import { defaultRestaurantSettings } from "../src/lib/settings/defaults";
import type { Order } from "../src/lib/types";

type JsonRecord = Record<string, unknown>;
type CatalogProduct = JsonRecord & {
  id?: string;
  slug?: string;
  nameAr?: string;
  shortDescriptionAr?: string;
  fullDescriptionAr?: string;
  badgeAr?: string;
  tags?: string[];
  images?: Array<JsonRecord & { alt?: string }>;
  modifierGroupIds?: string[];
};
type CatalogModifier = JsonRecord & {
  id?: string;
  nameAr?: string;
  descriptionAr?: string;
  options?: Array<JsonRecord & { id?: string; nameAr?: string; price?: number; available?: boolean }>;
};
type OrderItem = JsonRecord & {
  productId?: string;
  nameAr?: string;
  modifiers?: Array<JsonRecord & { groupNameAr?: string; optionNamesAr?: string[]; optionPrice?: number }>;
};
type OrderRecord = JsonRecord & {
  customer?: { name?: string; phone?: string };
  address?: { area?: string; street?: string };
  paymentMethod?: string;
  couponCode?: string;
  changeFor?: number | null;
  discount?: number;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  items?: OrderItem[];
  whatsappMessage?: string;
  whatsappUrl?: string;
};

const ROOT = process.cwd();
const settingsPath = path.join(ROOT, "data", "restaurant-settings.json");
const ordersPath = path.join(ROOT, "data", "orders.json");
const catalogPath = path.join(ROOT, "data", "catalog.json");

function backup(file: string) {
  const backupFile = `${file}.bak`;
  if (!fs.existsSync(backupFile)) fs.copyFileSync(file, backupFile);
}

function writeJson(file: string, data: unknown) {
  backup(file);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Repaired ${path.relative(ROOT, file)}`);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8")) as JsonRecord;
const mergedSettings = {
  ...defaultRestaurantSettings,
  ...settings,
  address: "٢٥ شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
  area: "التجمع الخامس",
  city: "القاهرة الجديدة",
  closedMessage: "المطعم مقفول دلوقتي، بس تقدر تحجز طلبك لوقت لاحق.",
  paymentMethods: defaultRestaurantSettings.paymentMethods,
  wallets: defaultRestaurantSettings.wallets,
  zones: defaultRestaurantSettings.zones,
  coupons: defaultRestaurantSettings.coupons,
  checkoutMessage: defaultRestaurantSettings.checkoutMessage,
};
writeJson(settingsPath, mergedSettings);

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as { products?: CatalogProduct[]; modifiers?: CatalogModifier[] };
for (const modifier of catalog.modifiers || []) {
  if (modifier.id === "mod-92516ee0") {
    modifier.nameAr = "اختار الحجم";
    modifier.descriptionAr = "اختيار حجم السلطة";
    for (const option of modifier.options || []) {
      if (option.id === "size-normal") option.nameAr = "عادي";
      if (option.id === "size-large") option.nameAr = "كبير";
    }
  }
  if (modifier.id === "mod-9fbaad87") {
    modifier.nameAr = "الإضافات";
    modifier.descriptionAr = "إضافات اختيارية";
    for (const option of modifier.options || []) {
      if (option.id === "extra-avocado") option.nameAr = "أفوكادو زيادة";
      if (option.id === "extra-chicken") option.nameAr = "فراخ زيادة";
      if (option.id === "extra-feta") option.nameAr = "جبنة فيتا";
    }
  }
}
for (const product of catalog.products || []) {
  if (product.slug === "premium-avocado-salad") {
    product.nameAr = "سلطة أفوكادو بريميوم";
    product.shortDescriptionAr = "فراخ مشوية، أفوكادو، خس كريسبي، طماطم شيري وصوص مخصوص";
    product.fullDescriptionAr = "سلطة مميزة بفراخ مشوية وأفوكادو طازة وخضار فريش مع صوص مخصوص بطعم متوازن ومناسب للغدا أو العشا.";
    product.badgeAr = "اختيار الشيف";
    product.tags = ["مميز", "اختيار الشيف"];
    for (const image of product.images || []) {
      image.alt = "سلطة أفوكادو بريميوم";
    }
  }
}
writeJson(catalogPath, catalog);

const refreshedCatalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as { products?: CatalogProduct[]; modifiers?: CatalogModifier[] };
const refreshedSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8")) as { whatsapp?: string; area?: string };
const orders = JSON.parse(fs.readFileSync(ordersPath, "utf8")) as OrderRecord[];

const rebuiltOrders = orders.map((order) => {
  const items = (order.items || []).map((item) => {
    const product = refreshedCatalog.products?.find((entry) => entry.id === item.productId);
    const productGroups = (product?.modifierGroupIds || [])
      .map((groupId) => refreshedCatalog.modifiers?.find((entry) => entry.id === groupId))
      .filter((value): value is CatalogModifier => Boolean(value));

    const fixedModifiers = (item.modifiers || []).map((modifier, index) => {
      const group = productGroups[index];
      const groupNameAr = group?.nameAr || modifier.groupNameAr || "";
      const optionNamesAr =
        group?.options
          ?.filter((option) => (typeof modifier.optionPrice === "number" ? option.price === modifier.optionPrice : true))
          .map((option) => option.nameAr || "")
          .filter(Boolean)
          .slice(0, modifier.optionNamesAr?.length || 1) || modifier.optionNamesAr || [];

      return {
        ...modifier,
        groupNameAr,
        optionNamesAr,
      };
    });

    return {
      ...item,
      nameAr: product?.nameAr || item.nameAr || "",
      modifiers: fixedModifiers,
    };
  });

  const rebuilt: OrderRecord = { ...order, items };
  if (typeof rebuilt.address?.area === "string" && rebuilt.address.area.includes("?")) {
    rebuilt.address.area = mergedSettings.area as string;
  }
  if (typeof rebuilt.address?.street === "string" && rebuilt.address.street.includes("?")) {
    rebuilt.address.street = "شارع التسعين الشمالي";
  }

  const paymentMethodLabel =
    order.paymentMethod === "cash"
      ? "كاش عند الاستلام"
      : order.paymentMethod === "card_on_delivery"
        ? "بطاقة عند الاستلام"
        : order.paymentMethod === "instapay"
          ? "إنستا باي"
          : "محفظة إلكترونية";

  const message = buildWhatsAppMessage({
    order: { ...(rebuilt as unknown as Order), items } as Order,
    customer: {
      name: order.customer?.name || "",
      phone: order.customer?.phone || "",
    },
    address: {
      area: order.address?.area || "",
      street: order.address?.street || "",
      building: "",
    },
    paymentMethodLabel,
    settings: {
      ...defaultRestaurantSettings,
      ...mergedSettings,
      checkoutMessage: defaultRestaurantSettings.checkoutMessage,
    },
    changeFor: order.changeFor ?? null,
    couponCode: order.couponCode,
    discountValue: order.discount ?? 0,
    subtotal: order.subtotal ?? 0,
    deliveryFee: order.deliveryFee ?? 0,
    total: order.total ?? 0,
    deliveryTimeLabel: "من 25 لـ 40 دقيقة",
  });

  return {
    ...rebuilt,
    whatsappMessage: message,
    whatsappUrl: `https://wa.me/${refreshedSettings.whatsapp}?text=${encodeURIComponent(message)}`,
  };
});

writeJson(ordersPath, rebuiltOrders);
fs.copyFileSync(catalogPath, `${catalogPath}.bak`);
fs.copyFileSync(ordersPath, `${ordersPath}.bak`);
fs.copyFileSync(settingsPath, `${settingsPath}.bak`);

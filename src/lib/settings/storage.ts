import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { defaultRestaurantSettings } from "./defaults";
import type { RestaurantSettings } from "@/types/settings";

const SOURCE_DATA_DIR = path.join(process.cwd(), "data");
const RUNTIME_DATA_DIR = process.env.VERCEL ? path.join("/tmp", "delivery-data") : SOURCE_DATA_DIR;
const SETTINGS_PATH = path.join(RUNTIME_DATA_DIR, "restaurant-settings.json");
const ORDERS_PATH = path.join(RUNTIME_DATA_DIR, "orders.json");
const SOURCE_SETTINGS_PATH = path.join(SOURCE_DATA_DIR, "restaurant-settings.json");
const SOURCE_ORDERS_PATH = path.join(SOURCE_DATA_DIR, "orders.json");

let settingsQueue: Promise<unknown> = Promise.resolve();
let ordersQueue: Promise<unknown> = Promise.resolve();

async function ensureDir() {
  await fs.mkdir(RUNTIME_DATA_DIR, { recursive: true });
}

async function seedFromSource(targetPath: string, sourcePath: string) {
  try {
    await fs.access(targetPath);
  } catch {
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    } catch {
      // ignore source seed failure
    }
  }
}

async function readJson<T>(filePath: string, fallback: T, sourcePath?: string): Promise<T> {
  if (sourcePath) {
    await seedFromSource(filePath, sourcePath);
  }
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic(filePath: string, data: unknown, queue: Promise<unknown>) {
  await ensureDir();
  const previous = `${filePath}.bak`;
  const temp = `${filePath}.tmp`;
  const next = queue.then(async () => {
    try {
      await fs.copyFile(filePath, previous);
    } catch {
      // ignore missing backup source
    }
    await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(temp, filePath);
  });
  return next;
}

function normalizeSettings(settings: Partial<RestaurantSettings>): RestaurantSettings {
  const next = {
    ...defaultRestaurantSettings,
    ...settings,
  } as RestaurantSettings;
  return {
    ...next,
    paymentMethods: Array.isArray(settings.paymentMethods) && settings.paymentMethods.length ? settings.paymentMethods : defaultRestaurantSettings.paymentMethods,
    wallets: Array.isArray(settings.wallets) && settings.wallets.length ? settings.wallets : defaultRestaurantSettings.wallets,
    zones: Array.isArray(settings.zones) && settings.zones.length ? settings.zones : defaultRestaurantSettings.zones,
    coupons: Array.isArray(settings.coupons) && settings.coupons.length ? settings.coupons : defaultRestaurantSettings.coupons,
    checkoutMessage: settings.checkoutMessage ? { ...defaultRestaurantSettings.checkoutMessage, ...settings.checkoutMessage } : defaultRestaurantSettings.checkoutMessage,
  };
}

export async function readRestaurantSettings(): Promise<RestaurantSettings> {
  const settings = await readJson<Partial<RestaurantSettings>>(SETTINGS_PATH, {}, SOURCE_SETTINGS_PATH);
  return normalizeSettings(settings);
}

export async function writeRestaurantSettings(settings: RestaurantSettings) {
  settingsQueue = writeJsonAtomic(SETTINGS_PATH, settings, settingsQueue);
  await settingsQueue;
  return settings;
}

export async function readOrders<T = unknown[]>(): Promise<T> {
  return readJson<T>(ORDERS_PATH, [] as T, SOURCE_ORDERS_PATH);
}

export async function writeOrders<T>(orders: T) {
  ordersQueue = writeJsonAtomic(ORDERS_PATH, orders, ordersQueue);
  await ordersQueue;
  return orders;
}

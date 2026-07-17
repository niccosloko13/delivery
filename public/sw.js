const CACHE_VERSION = "2026-07-17-pwa-1";
const STATIC_CACHE = `alef-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `alef-runtime-${CACHE_VERSION}`;
const SHELL_CACHE = `alef-shell-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/",
  "/menu",
  "/cart",
  "/checkout",
  "/account",
  "/account/orders",
  "/track",
  "/icons/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

const PRIVATE_PATHS = ["/admin", "/api/admin", "/api/orders", "/api/public/orders", "/api/auth", "/login"];
const PUBLIC_DATA_PATHS = ["/api/public/catalog", "/api/public/settings"];
const STATIC_PATH_MATCHERS = ["/_next/static/", "/icons/", "/screenshots/", "/images/", "/uploads/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, SHELL_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (PRIVATE_PATHS.some((path) => url.pathname.startsWith(path))) {
    return;
  }

  if (PUBLIC_DATA_PATHS.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (STATIC_PATH_MATCHERS.some((path) => url.pathname.startsWith(path)) || url.pathname === "/manifest.webmanifest") {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }
});

async function handleNavigation(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/admin")) {
    return fetch(request);
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(null, { status: 504, statusText: "Offline" });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

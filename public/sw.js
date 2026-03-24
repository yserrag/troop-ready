/// <reference lib="webworker" />

// TroopReady Service Worker — offline-first shell
// WO#1: Minimal shell with pre-caching, NetworkFirst for API, BackgroundSync stub

const CACHE_NAME = "troopready-v1";
const APP_SHELL = ["/", "/manifest.json"];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: NetworkFirst for /api/*, stale-while-revalidate for app shell
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // NetworkFirst for API routes (30min TTL)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      });
      return cached || fetched;
    })
  );
});

// BackgroundSync: offline-sync queue (stub — WO#4 implements full logic)
self.addEventListener("sync", (event) => {
  if (event.tag === "offline-sync") {
    event.waitUntil(
      // WO#4: Read from IndexedDB queue, POST each action to /api/sync
      Promise.resolve()
    );
  }
});

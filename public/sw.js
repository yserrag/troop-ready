/// <reference lib="webworker" />

// TroopReady Service Worker — offline-first shell
// WO#3: Added event data proactive caching ("camping insurance")

const CACHE_NAME = "troopready-v2";
const EVENT_CACHE = "troopready-events-v1";
const APP_SHELL = ["/", "/manifest.json"];
const EVENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
          .filter((key) => key !== CACHE_NAME && key !== EVENT_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Event API: CacheFirst with 24h TTL ("camping insurance")
  const eventApiMatch = url.pathname.match(/^\/api\/events\/([^/]+)$/);
  if (eventApiMatch) {
    event.respondWith(
      caches.open(EVENT_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);

        if (cached) {
          // Check TTL via custom header
          const cachedTime = cached.headers.get("x-sw-cached-at");
          if (cachedTime && Date.now() - parseInt(cachedTime, 10) < EVENT_CACHE_TTL) {
            // Still fresh — return cached, update in background
            fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  const headers = new Headers(response.headers);
                  headers.set("x-sw-cached-at", Date.now().toString());
                  response.clone().arrayBuffer().then((body) => {
                    cache.put(event.request, new Response(body, {
                      status: response.status,
                      statusText: response.statusText,
                      headers,
                    }));
                  });
                }
              })
              .catch(() => {});
            return cached;
          }
        }

        // Cache miss or stale — fetch from network
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set("x-sw-cached-at", Date.now().toString());
            const body = await response.clone().arrayBuffer();
            await cache.put(event.request, new Response(body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            }));
          }
          return response;
        } catch (err) {
          // Network failed — return stale cache if available
          if (cached) return cached;
          throw err;
        }
      })
    );
    return;
  }

  // Other API routes: NetworkFirst (30min TTL)
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

  // Event pages: when /e/{shortId} is fetched, also proactively cache the API data
  const eventPageMatch = url.pathname.match(/^\/e\/([^/]+)\/?$/);
  if (eventPageMatch) {
    const shortId = eventPageMatch[1];
    // Proactively cache the API response in the background
    const apiUrl = new URL(`/api/events/${shortId}`, url.origin);
    fetch(apiUrl.toString())
      .then((response) => {
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set("x-sw-cached-at", Date.now().toString());
          response.clone().arrayBuffer().then((body) => {
            caches.open(EVENT_CACHE).then((cache) => {
              cache.put(apiUrl.toString(), new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers,
              }));
            });
          });
        }
      })
      .catch(() => {});
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

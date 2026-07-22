/* Jarvis OS service worker — offline shell + cached static assets.
   Network-first for navigations and API calls, cache-first for
   hashed build assets. */

const CACHE = "jarvis-os-v2";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  // API calls are always live — but answer with a clear offline signal rather
  // than a network error, so the app can degrade gracefully instead of hanging.
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(
          JSON.stringify({ offline: true, error: "Offline — this needs a connection. Local features still work." }),
          { status: 503, headers: { "content-type": "application/json" } }
        )
      )
    );
    return;
  }

  // Hashed build assets: cache-first
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(e.request).then((hit) =>
        hit ||
        fetch(e.request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return resp;
        })
      )
    );
    return;
  }

  // Navigations & the rest: network-first with cache fallback (offline shell)
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("/")))
  );
});

// Notifications relayed from the page (shown via the SW so they survive tab-backgrounding)
self.addEventListener("message", (e) => {
  if (e.data?.type === "notify") {
    self.registration.showNotification(e.data.title || "Jarvis", {
      body: e.data.body || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
    });
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});

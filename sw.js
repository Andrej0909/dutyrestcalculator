const cacheName = "fdp-calc-v1";
// Ha van külön CSS vagy JS fájl, add hozzá ide!
const cacheUrls = [
  "./",
  "index.html",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(cacheUrls);
    })
  );
  self.skipWaiting(); // Azonnal aktiválódjon, ne várjon
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Régi cache-ek törlése
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Azonnal vegye át az irányítást
  );
});

self.addEventListener("fetch", (event) => {
  // Csak same-origin kéréseket kezelünk
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== "basic") {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        })
        .catch(() => {
          return caches.match("index.html");
        });
    })
  );
});

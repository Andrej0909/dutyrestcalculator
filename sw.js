const cacheName = "fdp-calc-v1";
// Itt add meg a fájlok pontos nevét! 
// Ha van CSS vagy JS külön fájlban, azokat is írd ide.
const cacheUrls = [
  "./",
  "index.html",
  "manifest.json" // Ha készítesz hozzá manifestet is
];

// Service Worker telepítése
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("FDP Cache megnyitva");
      return cache.addAll(cacheUrls);
    })
  );
});

// Erőforrások kiszolgálása
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Ha megvan a cache-ben, adjuk vissza azt
      if (cachedResponse) {
        return cachedResponse;
      }

      // Ha nincs meg, töltsük le és mentsük el a jövőre
      return fetch(event.request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        })
        .catch(() => {
          // Ha teljesen offline vagyunk és nincs a cache-ben a kért fájl
          // Akkor adjuk vissza a főoldalt (index.html)
          return caches.match("index.html");
        });
    })
  );
});
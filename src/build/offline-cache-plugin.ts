import type {Plugin} from "vite";

export function createOfflineWorkerSource(assetPaths:string[],cacheVersion="v1"):string{
  const precache=JSON.stringify([...new Set(["/","/index.html",...assetPaths.map(path=>path.startsWith("/")?path:`/${path}`)])]);
  return `const CACHE_NAME = "ankisubmarine-shell-${cacheVersion}";
const PRECACHE_URLS = ${precache};

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("ankisubmarine-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("/index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match("/index.html")) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
`;
}

export function offlineCachePlugin():Plugin{
  return {
    name:"ankisubmarine-offline-shell",
    apply:"build",
    generateBundle(_options,bundle){
      const assets=Object.values(bundle)
        .filter(file=>file.fileName!=="sw.js")
        .map(file=>file.fileName);
      this.emitFile({
        type:"asset",
        fileName:"sw.js",
        source:createOfflineWorkerSource(assets),
      });
    },
  };
}

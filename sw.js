// 星動遊樂園 DEMO：把解密後存在 Cache 的原型檔案，在 site/ 路徑下提供（支援重新整理、hash 路由、相對路徑）
const CACHE = "sp-demo-v1";
const base = new URL("./", self.location.href).href, SITE = base + "site/";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (!e.request.url.startsWith(SITE)) return;
  e.respondWith((async () => {
    const u = new URL(e.request.url); u.search = ""; u.hash = "";
    let key = u.href; if (key.endsWith("/")) key += "index.html";
    const hit = await (await caches.open(CACHE)).match(key);
    if (hit) return hit;
    if (e.request.mode === "navigate") return Response.redirect(base + "index.html", 302);
    return new Response("", { status: 404 });
  })());
});

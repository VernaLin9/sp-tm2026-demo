// 星動遊樂園 DEMO：把解密後存在 Cache 的原型檔案，在 site/ 路徑下提供（支援重新整理、hash 路由、相對路徑）
const CACHE = "sp-demo-v1";
const base = new URL("./", self.location.href).href, SITE = base + "site/";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
// 手機上存的是舊版？（每次重新打包 version.json 都會變）只在「打開頁面」時檢查一次，離線就當沒事
async function stale() {
  try {
    const c = await caches.open(CACHE); const m = await c.match(base + "_version"); const cur = m ? await m.text() : "";
    const r = await fetch(base + "version.json", { cache: "no-store" }); if (!r.ok) return false;
    const live = String((await r.json()).v || ""); return !!live && cur !== live;
  } catch (e) { return false; }
}
self.addEventListener("fetch", (e) => {
  if (!e.request.url.startsWith(SITE)) return;
  e.respondWith((async () => {
    const u = new URL(e.request.url); u.search = ""; u.hash = "";
    let key = u.href; if (key.endsWith("/")) key += "index.html";
    if (e.request.mode === "navigate" && await stale()) return Response.redirect(base + "index.html?next=" + encodeURIComponent(u.href.slice(SITE.length)) + "&stale=1", 302);
    const hit = await (await caches.open(CACHE)).match(key);
    if (hit) return hit;
    if (e.request.mode === "navigate") return Response.redirect(base + "index.html?next=" + encodeURIComponent(u.href.slice(SITE.length)), 302); // 解鎖後回到原本那一頁
    return new Response("", { status: 404 });
  })());
});

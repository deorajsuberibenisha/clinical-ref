// offline cache — version d9b79bf634
const C = "bcr-polish-35285ba1f6b4";
const CORE = ["./", "./index.html", "./assets-1.js", "./assets-2.js", "./assets-3.js", "./manifest.webmanifest", "./firebase-sdk.js", "./firebase-config.js", "./icon-192.png", "./icon-512.png", "./maskable-512.png"];
const PACKS = [];  /* original page photos removed: every guide is fully typed */
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"}))).then(() => Promise.allSettled(PACKS.map(u => c.add(new Request(u, {cache: "reload"})))))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin && /firebase-config\.js$/.test(u.pathname)) {
    e.respondWith(fetch(r, {cache: "no-cache"}).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r)));
  } else if (u.origin === location.origin) {
    e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; }).catch(() => caches.match("./index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
  }
});

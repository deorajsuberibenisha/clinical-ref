// offline cache — version d9b79bf634
const C = "bcr-2.0-20261111-5";
const CORE = ["./", "./index.html", "./eluna.js", "./ludo.js", "./assets-1.js", "./manifest.webmanifest", "./firebase-sdk.js", "./icon-192.png", "./icon-512.png", "./maskable-512.png"];
/* optional files are cached when available but can never stop offline mode from installing (all-or-nothing addAll used to include the config) */
const PACKS = ["./firebase-config.js"];  /* original page photos removed: every guide is fully typed */
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"}))).then(() => Promise.allSettled(PACKS.map(u => c.add(new Request(u, {cache: "reload"})))))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin && /firebase-config\.js$/.test(u.pathname)) {
    e.respondWith(fetch(r, {cache: "no-cache"}).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r)));
  } else if (u.origin === location.origin) {
    e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; }).catch(() => caches.match("./index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com$|^cdnjs\.cloudflare\.com$|^cdn\.jsdelivr\.net$|^tessdata\.projectnaptha\.com$/.test(u.hostname)) {   /* fonts, and the PDF / OCR libraries Eluna loads, kept for offline use */
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
  }
});
/* tapping a notification opens the app at the chat or game it is about */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "#chat";
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { c.postMessage({nav: url}); return c.focus(); }
    return self.clients.openWindow(self.registration.scope + url);
  }));
});

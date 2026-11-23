// Garde l'app sur le téléphone pour qu'elle s'ouvre vite, même avec un réseau faible.
// Les données du stock restent sur Supabase (jamais mises en cache ici).
const V = "mc-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Supabase : réseau direct
  if (/\.pdf$/i.test(u.pathname)) return; // les PDF restent sur le réseau
  // réseau d'abord (toujours la dernière version), copie de secours hors ligne
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});

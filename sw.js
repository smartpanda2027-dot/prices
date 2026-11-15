// غيّر رقم النسخة عند كل تحديث للأسعار حتى يحمّل الجهاز الملفات الجديدة
const VER = 'prices-v5';
const FILES = ['./', './index.html', './scan.html', './manifest-scan.json', './data.js', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (e.request.method !== 'GET') return;
  if (u === LIB) {
    e.respondWith(caches.open(VER).then(c => c.match(u).then(hit => hit || fetch(e.request).then(r => { c.put(u, r.clone()); return r; }))));
    return;
  }
  if (new URL(u).origin !== location.origin) return;
  // network first, so pages and prices are always fresh; cache is the offline fallback
  e.respondWith(fetch(e.request).then(r => {
    const cp = r.clone(); caches.open(VER).then(c => c.put(e.request, cp)); return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});

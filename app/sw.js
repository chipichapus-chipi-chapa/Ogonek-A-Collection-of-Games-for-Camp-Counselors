/* Офлайн-кэш: при первом открытии всё приложение сохраняется на телефон. */
const VERSION = 'ogonek-v2';
const FILES = [
  './', './index.html', './manifest.json', './css/app.css', './js/app.js', './js/data.js', './js/mascot.js',
  './fonts/fonts.css', './fonts/Neucha-cyrillic-0.woff2','./fonts/Neucha-latin-1.woff2','./fonts/Nunito-cyrillic-2.woff2','./fonts/Nunito-latin-3.woff2','./fonts/YanoneKaffeesatz-cyrillic-4.woff2','./fonts/YanoneKaffeesatz-latin-5.woff2',
  './img/icon-192.png', './img/icon-512.png',
  './img/ogonek/star.webp','./img/ogonek/wink.webp','./img/ogonek/love.webp','./img/ogonek/cool.webp','./img/ogonek/wow.webp','./img/ogonek/sleepy.webp','./img/ogonek/point.webp'
];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// Сначала кэш (мгновенно и без сети), а в фоне тянем свежую версию — обновления видны при следующем открытии
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.open(VERSION).then(cache => cache.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(() => cache.match('./index.html'));
  })));
});

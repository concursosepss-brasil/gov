// Deixa o site instalável e abre mesmo sem internet (mostra a última versão salva).
// v2: ao abrir uma página, sempre confere se há versão nova no servidor (antes o navegador podia mostrar uma cópia de até 1 hora).
const CACHE = 'site-gov-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  // só cuida dos arquivos do próprio site; Firebase, WhatsApp e fontes seguem direto pela internet
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const pedido = req.mode === 'navigate' ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : req;
  e.respondWith(fetch(pedido).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
    .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});

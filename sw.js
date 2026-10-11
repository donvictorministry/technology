var V = 'dv-article-v1',
    F = ['./', 'index.html', 'styles.css', 'app.js', 'contents.js', 'page.js', 'nav.js', 'manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(F.map(function (f) { return c.add(f).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n.indexOf('dv-article-') === 0 && n !== V; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(function (x) {
      return x.status === 404 ? caches.match('index.html').then(function (c) { return c || x; }) : x;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (c) {
    var n = fetch(r).then(function (x) {
      if (x.ok) { var y = x.clone(); caches.open(V).then(function (k) { k.put(r, y); }); }
      return x;
    }).catch(function () { return c; });
    return c || n;
  }));
});

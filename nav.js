(function () {
'use strict';
var D = window.DV;
if (!D || !D.contents || !D.page) return;
var C = D.contents, S = C.sections, L = D.menu('left'), items = {};

function idx(id) { for (var i = 0; i < S.length; i++) if (S[i].id === id) return i; return -1; }
function url(id) { return D.base + (id === 'home' ? '' : id); }
function slug() {
  var p = decodeURIComponent(location.pathname);
  if (p.indexOf(D.base) === 0) p = p.slice(D.base.length);
  return p.replace(/index\.html$/, '').replace(/\/+$/, '') || 'home';
}
function meta(sel, attr, val) { var e = document.querySelector(sel); if (e) e.setAttribute(attr, val); }

function show(id) {
  var i = idx(id);
  if (i < 0) { id = 'home'; i = 0; history.replaceState(null, '', url(id)); }
  var s = S[i], d = '';
  D.cur = id;
  for (var k = 0; k < s.blocks.length; k++) if (typeof s.blocks[k] === 'string') { d = s.blocks[k].slice(0, 158); break; }
  document.title = id === 'home' ? C.meta.title : s.title + ' | ' + C.meta.author;
  meta('link[rel=canonical]', 'href', location.origin + url(id));
  meta('meta[name=description]', 'content', d);
  meta('meta[property="og:url"]', 'content', location.origin + url(id));
  meta('meta[property="og:title"]', 'content', document.title);
  meta('meta[property="og:description"]', 'content', d);
  for (var n in items) {
    items[n].classList.toggle('dvActive', n === id);
    if (n === id) items[n].setAttribute('aria-current', 'page'); else items[n].removeAttribute('aria-current');
  }
  D.emit('route', id);
}

D.go = function (id) { history.pushState(null, '', url(id)); show(id); };

S.forEach(function (s) {
  items[s.id] = L.add({ label: s.menu, href: url(s.id), fn: function () { D.go(s.id); } });
});

function pg(label, s, cls) {
  var a = document.createElement('a'), l = document.createElement('span'), t = document.createElement('strong');
  a.className = 'dvPagerBtn ' + cls; a.href = url(s.id);
  l.textContent = label; t.textContent = s.menu;
  a.appendChild(l); a.appendChild(t);
  a.addEventListener('click', function (e) { e.preventDefault(); D.go(s.id); });
  return a;
}

D.on('rendered', function (id) {
  var i = idx(id), w = document.createElement('nav');
  w.className = 'dvPager'; w.setAttribute('aria-label', 'Pagination');
  if (i > 0) w.appendChild(pg('Previous', S[i - 1], ''));
  if (i < S.length - 1) w.appendChild(pg('Next', S[i + 1], 'dvNext'));
  D.article.appendChild(w);
});

window.addEventListener('popstate', function () { show(slug()); });
D.on('ready', function () { show(slug()); });
})();

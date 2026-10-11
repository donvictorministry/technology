(function () {
'use strict';
var D = window.DV = { base: window.DVBASE || '/', ev: {}, cur: 'home', mods: ['contents.js', 'page.js', 'nav.js'] };
var $ = D.$ = function (i) { return document.getElementById(i); };

D.on = function (n, f) { (D.ev[n] = D.ev[n] || []).push(f); };
D.emit = function (n, a) { (D.ev[n] || []).forEach(function (f) { try { f(a); } catch (e) {} }); };
D.get = function (k, d) { try { var v = localStorage.getItem('dvoff.' + k); return v === null ? d : v; } catch (e) { return d; } };
D.set = function (k, v) { try { localStorage.setItem('dvoff.' + k, v); } catch (e) {} };

var P = {
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  dots: '<path d="M12 5v.01M12 12v.01M12 19v.01" stroke-width="3.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  text: '<path d="M3 20L9 5l6 15M5.5 14h7M19 9v6M16 12h6"/>',
  install: '<path d="M12 4v11M8 11l4 4 4-4M5 20h14"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-width="3"/>',
  mail: '<path d="M3 6h18v12H3zM3 7l9 7 9-7"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  wa: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z"/><path d="M9 8c0 4 3 7 7 7l1-2-2-1-1 1c-1-.4-2.200-1.600-2.600-2.600l1-1-1-2z"/>',
  fb: '<path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z"/>'
};
D.icon = function (n) { return '<svg class="dvIco" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>'; };

var tt;
D.toast = function (m) {
  var t = $('dvToast'); t.textContent = m; t.classList.add('dvShow');
  clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('dvShow'); }, 2200);
};

D.close = function () {
  ['dvLeft', 'dvRight'].forEach(function (i) { var a = $(i); a.classList.remove('dvOpen'); a.setAttribute('aria-hidden', 'true'); });
  $('dvScrim').classList.remove('dvOpen');
  $('dvBtnLeft').setAttribute('aria-expanded', 'false');
  $('dvBtnRight').setAttribute('aria-expanded', 'false');
};
D.open = function (s) {
  D.close();
  var a = $(s === 'left' ? 'dvLeft' : 'dvRight');
  a.classList.add('dvOpen'); a.setAttribute('aria-hidden', 'false');
  $('dvScrim').classList.add('dvOpen');
  $(s === 'left' ? 'dvBtnLeft' : 'dvBtnRight').setAttribute('aria-expanded', 'true');
  a.querySelector('button').focus();
};

D.menu = function (side) {
  var l = $(side === 'left' ? 'dvLeftList' : 'dvRightList');
  return {
    add: function (o) {
      var e = document.createElement(o.href ? 'a' : 'button'), sp = document.createElement('span');
      e.className = 'dvItem';
      if (o.href) e.href = o.href; else e.type = 'button';
      if (o.icon) e.insertAdjacentHTML('afterbegin', D.icon(o.icon));
      sp.textContent = o.label; e.appendChild(sp);
      e.dvLabel = function (t) { sp.textContent = t; };
      e.addEventListener('click', function (ev) {
        if (o.fn) { ev.preventDefault(); o.fn(ev); }
        if (!o.keep) D.close();
      });
      if (o.top) l.insertBefore(e, l.firstChild); else l.appendChild(e);
      return e;
    }
  };
};

D.modal = function (t, body) {
  var w = document.createElement('div');
  w.className = 'dvModalWrap';
  w.innerHTML = '<div class="dvModal" role="dialog" aria-modal="true"><div class="dvModalHead"><strong></strong><button type="button" class="dvHBtn dvXBtn" aria-label="Close">' + D.icon('close') + '</button></div><div class="dvModalBody"></div></div>';
  w.querySelector('strong').textContent = t;
  w.querySelector('.dvModalBody').appendChild(body);
  function k(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', k); w.remove(); }
  w.addEventListener('click', function (e) { if (e.target === w || e.target.closest('.dvXBtn')) close(); });
  document.addEventListener('keydown', k);
  document.body.appendChild(w);
  return { close: close };
};

/* Utilities and settings (right sidebar) */
function dvTheme(d) {
  document.documentElement.setAttribute('data-dv-theme', d ? 'dark' : 'light');
  var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = d ? '#18191a' : '#1877f2';
}
var dark = D.get('dark', '0') === '1', sz = +D.get('size', 0) || 0, sizes = [19, 21, 23], names = ['Normal', 'Large', 'Larger'], dp;
function dvSize() { document.documentElement.style.fontSize = sizes[sz] + 'px'; }
dvTheme(dark); dvSize();

var R = D.menu('right');
var bDark = R.add({ icon: 'moon', label: 'Dark mode: ' + (dark ? 'On' : 'Off'), keep: true, fn: function () {
  dark = !dark; D.set('dark', dark ? '1' : '0'); dvTheme(dark); bDark.dvLabel('Dark mode: ' + (dark ? 'On' : 'Off'));
} });
var bSize = R.add({ icon: 'text', label: 'Text size: ' + names[sz], keep: true, fn: function () {
  sz = (sz + 1) % 3; D.set('size', sz); dvSize(); bSize.dvLabel('Text size: ' + names[sz]);
} });
R.add({ icon: 'install', label: 'Install app', fn: function () {
  if (dp) { dp.prompt(); dp.userChoice.then(function () { dp = null; }); } else D.toast('Install is not available right now');
} });
R.add({ icon: 'share', label: 'Share', fn: function () {
  var d = { title: document.title, url: location.href };
  if (navigator.share) navigator.share(d).catch(function () {});
  else if (navigator.clipboard) navigator.clipboard.writeText(d.url).then(function () { D.toast('Link copied'); }, function () { D.toast('Could not copy the link'); });
  else D.toast('Sharing is not available');
} });

window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dp = e; });
window.addEventListener('appinstalled', function () { D.toast('App installed'); });

/* Shell wiring */
$('dvBtnLeft').innerHTML = D.icon('menu');
$('dvBtnRight').innerHTML = D.icon('dots');
$('dvCloseLeft').innerHTML = D.icon('close');
$('dvCloseRight').innerHTML = D.icon('close');
$('dvBtnLeft').addEventListener('click', function () { D.open('left'); });
$('dvBtnRight').addEventListener('click', function () { D.open('right'); });
$('dvCloseLeft').addEventListener('click', D.close);
$('dvCloseRight').addEventListener('click', D.close);
$('dvScrim').addEventListener('click', D.close);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') D.close(); });
D.article = $('dvArticle');
window.scrollTo = function () { $('dvMain').scrollTop = 0; };
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* Optional modules: any missing file is skipped without breaking the core */
function dvLoad(i) {
  if (i >= D.mods.length) { D.emit('ready'); return; }
  var s = document.createElement('script');
  s.src = D.mods[i];
  s.onload = s.onerror = function () { dvLoad(i + 1); };
  document.body.appendChild(s);
}
dvLoad(0);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();

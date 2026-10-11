(function () {
'use strict';
var D = window.DV;
if (!D || !D.contents) return;
var C = D.contents, S = C.sections;

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function txt(b) { return typeof b === 'string' ? b : (b.h || b.g || (b.r && b.r.replace(/\*/g, '')) || (b.b ? b.b + ' ' + b.t : '')); }

function dvCite() {
  var m = C.meta, y = m.year || 'n.d.', t = m.citeTitle || m.title,
      a = m.citeAuthor || 'Johnson, C.', bb = m.citeBib || 'Johnson, Chris',
      u = m.doi ? (/^https?:/.test(m.doi) ? m.doi : 'https://doi.org/' + m.doi) : location.origin + D.base;
  return { a1: a + ' (' + y + '). ', t: t, a2: '. ' + u, it: '(' + a.replace(/,.*$/, '') + ', ' + y + ')',
    bib: '@misc{johnson' + (m.year || 'nd') + ',\n  author = {' + bb + '},\n  title = {' + t + '},\n  year = {' + y + '},\n  url = {' + u + '}\n}' };
}

function blk(b, i, id) {
  var k = 'id="dv-' + id + '-' + i + '"';
  if (typeof b === 'string') {
    var tx = esc(b).replace(/\n/g, '<br>'), sc = find(id), fi = -1, q;
    for (q = 0; q < sc.blocks.length; q++) if (typeof sc.blocks[q] === 'string') { fi = q; break; }
    if (id === 'about-the-author' && i === fi) return '<div class="dvMore" ' + k + '><p class="dvMoreBody">' + tx + '</p><button type="button" class="dvMoreBtn" aria-expanded="false" onclick="var m=this.parentNode,o=m.classList.toggle(\'dvOpen\');this.textContent=o?\'Show Less\':\'Show More\';this.setAttribute(\'aria-expanded\',o)">Show More</button></div>';
    return '<p ' + k + '>' + tx + '</p>';
  }
  if (b.h) return '<h2 ' + k + '>' + esc(b.h) + '</h2>';
  if (b.g) return '<h3 ' + k + '>' + esc(b.g) + '</h3>';
  if (b.r) return '<p class="dvRef" ' + k + '>' + esc(b.r).replace(/\*(.+?)\*/g, '<em>$1</em>') + '</p>';
  if (b.b) return '<p ' + k + '><strong>' + esc(b.b) + '</strong> ' + esc(b.t) + '</p>';
  if (b.ic) return '<div class="dvIcons" ' + k + '>' + b.ic.map(function (c) {
    var u = (C.meta.contacts || {})[c[0]] || '';
    if (c[0] === 'Email' && u) u = 'mailto:' + u.replace(/^mailto:/, '');
    return u
      ? '<a class="dvIconBtn" href="' + esc(u) + '" aria-label="' + c[0] + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + D.icon(c[1]) + '</a>'
      : '<button type="button" class="dvIconBtn" data-dv-empty="1" aria-label="' + c[0] + '">' + D.icon(c[1]) + '</button>';
  }).join('') + '</div>';
  if (b.avatar) {
    var ph = C.meta.photo || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#c8ccd2"/><circle cx="80" cy="62" r="28" fill="#fff"/><path d="M24 160c0-34 25-56 56-56s56 22 56 56z" fill="#fff"/></svg>');
    return '<div class="dvAvatarWrap" ' + k + '><div class="dvAvatar"><img class="dvPhoto" src="' + esc(ph) + '" width="160" height="160" alt="' + esc(C.meta.author) + '"><svg class="dvGear" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" fill="none" stroke="#1877f2" stroke-width="3"/><circle cx="100" cy="100" r="94" fill="none" stroke="#1877f2" stroke-width="10" stroke-dasharray="12.3 12.3"/></svg></div><p class="dvAvName">' + esc(C.meta.author) + '</p><p class="dvAvRole">' + esc(C.meta.role || '') + '</p></div>';
  }
  if (b.info) {
    var mi = C.meta, ri = '';
    if (mi.affiliation) ri += '<p>' + esc(mi.affiliation) + '</p>';
    if (mi.orcid) ri += '<p>ORCID: <a href="https://orcid.org/' + esc(mi.orcid) + '" target="_blank" rel="noopener">https://orcid.org/' + esc(mi.orcid) + '</a></p>';
    if (mi.license) ri += '<p>License: ' + esc(mi.license) + '</p>';
    return ri ? '<div ' + k + '>' + ri + '</div>' : '';
  }
  if (b.cite) {
    var ci = dvCite();
    return '<div ' + k + '><p class="dvRef">' + esc(ci.a1) + '<em>' + esc(ci.t) + '</em>' + esc(ci.a2) + '</p><p>In text: ' + esc(ci.it) + '</p><div class="dvCiteBtns"><button type="button" class="dvMoreBtn" data-dv-copy="apa">Copy APA citation</button><button type="button" class="dvMoreBtn" data-dv-copy="bib">Copy BibTeX</button></div></div>';
  }
  if (b.decl) {
    var md = C.meta, od = '';
    [['Acknowledgements', md.acknowledgements], ['Funding', md.funding], ['Conflict of Interest', md.conflict]].forEach(function (x) {
      if (x[1]) od += '<h2>' + x[0] + '</h2><p>' + esc(x[1]).replace(/\n/g, '<br>') + '</p>';
    });
    return od;
  }
  if (b.form) return '<form class="dvForm" id="dvContactForm" ' + k + ' novalidate>' +
    '<label for="dvfName">Name</label><input class="dvInput" id="dvfName" type="text" autocomplete="name">' +
    '<label for="dvfEmail">Your email</label><input class="dvInput" id="dvfEmail" type="email" autocomplete="email">' +
    '<label for="dvfSubject">Subject</label><input class="dvInput" id="dvfSubject" type="text">' +
    '<label for="dvfMsg">Message</label><textarea class="dvInput" id="dvfMsg" rows="6"></textarea>' +
    '<button type="submit" class="dvSend">Send message</button></form>';
  return '';
}

function html(s) {
  return '<section id="dv-sec-' + s.id + '"><h1>' + esc(s.title) + '</h1>' +
    (s.by ? '<p class="dvBy">' + esc(s.by) + '</p>' : '') +
    s.blocks.map(function (b, i) { return blk(b, i, s.id); }).join('') + '</section>';
}

function find(id) { for (var i = 0; i < S.length; i++) if (S[i].id === id) return S[i]; }

function dvFit() {
  Array.prototype.forEach.call(D.article.querySelectorAll('.dvMore'), function (m) {
    var b = m.querySelector('.dvMoreBody');
    if (b.scrollHeight <= b.clientHeight + 2) m.querySelector('.dvMoreBtn').style.display = 'none';
  });
}

D.page = {
  render: function (id) {
    var s = find(id) || S[0];
    D.article.innerHTML = html(s);
    dvFit();
    window.scrollTo(0, 0);
    D.emit('rendered', s.id);
  },
  renderAll: function () {
    D.article.innerHTML = S.map(html).join('');
    dvFit();
    window.scrollTo(0, 0);
  },
  open: function (id, i) {
    if (D.go && D.cur !== id) D.go(id);
    var el = i < 0 ? null : document.getElementById('dv-' + id + '-' + i);
    if (!el) { if (i < 0) { var t = document.getElementById('dv-sec-' + id); if (t) t.scrollIntoView(); else window.scrollTo(0, 0); } return; }
    el.scrollIntoView({ block: 'start' });
    el.classList.remove('dvFlash'); void el.offsetWidth; el.classList.add('dvFlash');
    setTimeout(function () { el.classList.remove('dvFlash'); }, 1900);
  }
};

D.article.addEventListener('click', function (e) {
  if (e.target.closest('[data-dv-empty]')) D.toast('Link not set yet');
});

D.article.addEventListener('submit', function (e) {
  if (!e.target.closest('#dvContactForm')) return;
  e.preventDefault();
  var to = ((C.meta.contacts || {}).Email || '').replace(/^mailto:/, '').trim(),
      n = D.$('dvfName').value.trim(), em = D.$('dvfEmail').value.trim(),
      s = D.$('dvfSubject').value.trim(), m = D.$('dvfMsg').value.trim();
  if (!to) { D.toast('Email address not set yet'); return; }
  if (!n) { D.toast('Please enter your name'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { D.toast('Please enter a valid email address'); return; }
  if (!m) { D.toast('Please write a message'); return; }
  var u = 'mailto:' + to + '?subject=' + encodeURIComponent(s || 'Message from ' + n) +
          '&body=' + encodeURIComponent(m + '\r\n\r\n' + n + '\r\n' + em);
  if (u.length > 1900) { D.toast('Message is too long, please shorten it'); return; }
  D.toast('Opening your email app');
  location.href = u;
});

function dvSearch() {
  var w = document.createElement('div');
  w.innerHTML = '<input class="dvInput" type="search" placeholder="Search the paper" aria-label="Search the paper" autocomplete="off"><div class="dvResults"></div>';
  var inp = w.querySelector('input'), out = w.querySelector('.dvResults'), m = D.modal('Search', w);
  inp.addEventListener('input', function () {
    var q = inp.value.trim().toLowerCase(), r = [];
    out.innerHTML = '';
    if (q.length < 2) return;
    S.forEach(function (s) {
      s.blocks.forEach(function (b, i) {
        var t = txt(b), x = t.toLowerCase().indexOf(q);
        if (x >= 0 && r.length < 40) r.push({ s: s, i: i, t: (x > 50 ? '…' : '') + t.substr(Math.max(0, x - 50), 130) + '…' });
      });
    });
    var n = document.createElement('p'); n.className = 'dvResInfo';
    n.textContent = r.length ? r.length + (r.length === 40 ? '+' : '') + ' results' : 'No results';
    out.appendChild(n);
    r.forEach(function (o) {
      var b = document.createElement('button'), a = document.createElement('strong'), c = document.createElement('span');
      b.type = 'button'; b.className = 'dvRes'; a.textContent = o.s.menu; c.textContent = o.t;
      b.appendChild(a); b.appendChild(c);
      b.addEventListener('click', function () { m.close(); D.page.open(o.s.id, o.i); });
      out.appendChild(b);
    });
  });
  inp.focus();
}

function dvToc() {
  var w = document.createElement('div'), m = D.modal('Contents', w);
  function row(label, cls, id, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'dvRes ' + cls; b.textContent = label;
    b.addEventListener('click', function () { m.close(); D.page.open(id, i); });
    w.appendChild(b);
  }
  S.forEach(function (s) {
    row(s.menu, 'dvTocSec', s.id, -1);
    s.blocks.forEach(function (b, i) { if (b.h && s.id !== 'home') row(b.h, 'dvTocSub', s.id, i); });
  });
}

D.menu('right').add({ icon: 'list', label: 'Contents', fn: dvToc, top: true });
D.menu('right').add({ icon: 'search', label: 'Search', fn: dvSearch, top: true });

D.on('route', function (id) { D.page.render(id); });
D.on('ready', function () { if (!D.go) D.page.renderAll(); });
D.article.addEventListener('click', function (e) {
  var bt = e.target.closest('[data-dv-copy]');
  if (!bt) return;
  var c2 = dvCite(), x = bt.getAttribute('data-dv-copy') === 'bib' ? c2.bib : c2.a1 + c2.t + c2.a2;
  function ok() { D.toast('Citation copied'); }
  function fb() { var t = document.createElement('textarea'); t.value = x; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (er) { D.toast('Could not copy the citation'); } t.remove(); }
  if (navigator.clipboard) navigator.clipboard.writeText(x).then(ok, fb); else fb();
});
})();

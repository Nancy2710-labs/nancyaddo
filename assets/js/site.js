(function () {
  'use strict';

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Publication filter
  var filters = document.querySelectorAll('.filters button');
  var pubs = document.querySelectorAll('.pub');
  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      filters.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      pubs.forEach(function (p) { p.hidden = !(f === 'all' || p.getAttribute('data-cat') === f); });
    });
  });

  var FR = document.documentElement.lang === 'fr';

  // Collaboration form (FormSubmit AJAX, falls back to a plain POST if fetch fails to start)
  var form = document.getElementById('collab-form');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.className = 'form-status';
      status.textContent = FR ? 'Envoi en cours…' : 'Sending…';
      fetch('https://formsubmit.co/ajax/ansahaddonancy@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && (d.success === 'true' || d.success === true)) {
          status.textContent = FR ? 'Merci. Votre demande a été transmise.' : 'Thank you. Your request has been delivered.';
          form.reset();
        } else { throw new Error('rejected'); }
      }).catch(function () {
        status.className = 'form-status err';
        status.textContent = FR ? 'Envoi impossible. Veuillez écrire directement à ansahaddonancy@gmail.com.' : 'Could not send. Please email ansahaddonancy@gmail.com directly.';
      });
    });
  }

  // Panel router: each section opens on its own page (#/about, #/research, ...)
  var VIEWS = ['home', 'about', 'research', 'publications', 'experience', 'teaching', 'contact'];
  var TITLES = {
    home: 'Nancy Ansah-Addo — Ph.D. Student in Psychology · Personnel Selection Officer, CAF',
    about: 'About — Nancy Ansah-Addo',
    research: 'Research — Nancy Ansah-Addo',
    publications: 'Publications — Nancy Ansah-Addo',
    experience: 'Experience — Nancy Ansah-Addo',
    teaching: 'Teaching — Nancy Ansah-Addo',
    contact: 'Contact — Nancy Ansah-Addo'
  };
  var TITLES_FR = {
    home: 'Nancy Ansah-Addo — Doctorante en psychologie · Officière de sélection du personnel, FAC',
    about: 'À propos — Nancy Ansah-Addo',
    research: 'Recherche — Nancy Ansah-Addo',
    publications: 'Publications — Nancy Ansah-Addo',
    experience: 'Expérience — Nancy Ansah-Addo',
    teaching: 'Enseignement — Nancy Ansah-Addo',
    contact: 'Contact — Nancy Ansah-Addo'
  };
  if (FR) TITLES = TITLES_FR;
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    if (h === 'main') return null;               // skip link: leave the page as is
    var parts = h.split('/');
    var v = parts[0] || 'home', sub = parts[1] || '';
    if (v === 'top') v = 'home';
    if (v === 'rank-divide') { v = 'research'; sub = 'rank-divide'; }
    if (VIEWS.indexOf(v) < 0) v = 'home';
    return { v: v, sub: sub };
  }
  var firstRoute = true;
  function route() {
    var r = parseHash();
    if (!r) return;
    document.querySelectorAll('[data-view]').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-view') === r.v);
    });
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === r.v) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = TITLES[r.v];
    document.querySelectorAll('[data-lang-link]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('data-lang-link') + (location.hash || ''));
    });
    var target = r.sub && document.getElementById(r.sub);
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    if (!firstRoute) {
      var h = document.querySelector('[data-view="' + r.v + '"].is-active h1, [data-view="' + r.v + '"].is-active h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    firstRoute = false;
  }
  window.addEventListener('hashchange', route);
  route();

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();

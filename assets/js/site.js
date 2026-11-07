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

  // Collaboration form (FormSubmit AJAX, falls back to a plain POST if fetch fails to start)
  var form = document.getElementById('collab-form');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.className = 'form-status';
      status.textContent = 'Sending…';
      fetch('https://formsubmit.co/ajax/ansahaddonancy@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && (d.success === 'true' || d.success === true)) {
          status.textContent = 'Thank you. Your request has been delivered.';
          form.reset();
        } else { throw new Error('rejected'); }
      }).catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Could not send. Please email ansahaddonancy@gmail.com directly.';
      });
    });
  }

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();

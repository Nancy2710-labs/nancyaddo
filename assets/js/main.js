/* ============================================================
   NANCY ANSAH-ADDO · PhD WEBSITE — main.js
   Hash router (#/, #/about, ...) + boot, canvas, interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- CONFIG ---------- */
  var SITE = {
    email: "ansahaddonancy@gmail.com",
    email2: "ansahadd@ualberta.ca",
    routes: ["/", "/about", "/research", "/publications", "/experience", "/teaching", "/contact", "/social", "/collaborations"]
  };

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ============================================================
     BOOT SEQUENCE (once)
     ============================================================ */
  var bootEl = $("#boot");
  var bootDone = false;

  function runBoot() {
    if (reducedMotion || bootDone) { bootEl.classList.add("is-done"); bootDone = true; return; }
    var fill = $("#bootProgress"), pct = $("#bootPct"), status = $("#bootStatus");
    var lines = [
      ">> establishing secure channel",
      ">> decrypting personnel dossier",
      ">> calibrating neural telemetry",
      ">> locking target coordinates",
      ">> rendering command interface"
    ];
    var p = 0, li = 0;
    var timer = setInterval(function () {
      p = Math.min(100, p + 4 + Math.random() * 9);
      fill.style.width = p + "%";
      pct.textContent = Math.floor(p) + "%";
      if (p > (li + 1) * 20 && li < lines.length - 1) { li++; status.textContent = lines[li]; }
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          bootEl.classList.add("is-done");
          bootDone = true;
        }, 420);
      }
    }, 90);
  }

  /* ============================================================
     HASH ROUTER
     ============================================================ */
  var mainEl = $("#main");
  var navLinks = $all(".nav__link");

  function currentRoute() {
    var h = window.location.hash || "#/";
    var r = h.replace(/^#/, "") || "/";
    if (r.charAt(0) !== "/") r = "/" + r;
    r = r.split("?")[0].replace(/\/+$/, "") || "/";
    return SITE.routes.indexOf(r) !== -1 ? r : "/";
  }

  function toast(msg) {
    var t = $("#toast"), txt = $("#toastText");
    txt.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("is-show"); }, 1900);
  }

  var firstNav = true;

  function navigate() {
    var route = currentRoute();
    // close mobile nav
    document.body.classList.remove("nav-open");
    $("#navBurger").setAttribute("aria-expanded", "false");

    $all("[data-view]").forEach(function (v) { v.hidden = true; });
    var view = document.getElementById("view-" + route);
    if (!view) view = document.getElementById("view-/");
    view.hidden = false;

    // page title
    if (view.dataset.title) document.title = view.dataset.title;

    // entrance animation
    view.classList.remove("is-entering");
    void view.offsetWidth;
    view.classList.add("is-entering");

    // nav active states
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.dataset.route === route);
      if (a.dataset.route === route) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    // top of page
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });

    // refresh reveals + counters within the new view
    requestAnimationFrame(function () {
      observeReveals();
      animateCounters(view);
    });
    if (!firstNav) toast("SIGNAL LOCKED // " + route.toUpperCase());
    firstNav = false;

    // start/stop hero canvas
    if (route === "/") startNeural(); else stopNeural();
  }

  window.addEventListener("hashchange", navigate);

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  var burger = $("#navBurger");
  burger.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  // close the mobile menu when any nav link (internal or external) is tapped
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ============================================================
     SCROLL REVEALS
     ============================================================ */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function observeReveals() {
    $all(".js-reveal:not(.in-view), .reveal:not(.in-view)").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */
  function animateCounters(scope) {
    $all("[data-count]", scope).forEach(function (el) {
      if (el.dataset.done) return;
      var target = parseInt(el.dataset.count, 10) || 0;
      var suffix = el.dataset.suffix || "";
      if (reducedMotion) { el.textContent = target + suffix; el.dataset.done = "1"; return; }
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          observer.disconnect();
          var start = null, dur = 1400;
          function tick(t) {
            if (!start) start = t;
            var k = Math.min(1, (t - start) / dur);
            var eased = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (k < 1) requestAnimationFrame(tick);
            else el.dataset.done = "1";
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.5 });
      observer.observe(el);
    });
  }

  /* ============================================================
     TYPEWRITER (hero)
     ============================================================ */
  var typeEl = $("#typewriter");
  var phrases = [
    "PhD PSYCHOLOGY · UNIVERSITY OF ALBERTA (RAST LAB)",
    "PERSONNEL SELECTION OFFICER · CANADIAN ARMED FORCES",
    "RESEARCH: BOUNDARY-SPANNING LEADERSHIP x TRUST",
    "EDMONTON, ALBERTA · SERVING + STUDYING"
  ];
  function typewriter() {
    if (!typeEl || reducedMotion) {
      if (typeEl) typeEl.textContent = phrases[0];
      return;
    }
    var pi = 0, ci = 0, deleting = false;
    (function step() {
      var word = phrases[pi];
      typeEl.textContent = word.slice(0, ci);
      var speed = deleting ? 32 : 58;
      if (!deleting && ci === word.length) { speed = 1600; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; speed = 420; }
      else ci += deleting ? -1 : 1;
      setTimeout(step, speed);
    })();
  }

  /* ============================================================
     NEURAL PARTICLE CANVAS (hero)
     ============================================================ */
  var canvas = $("#neural"), ctx = canvas.getContext("2d");
  var neural = { nodes: [], running: false, raf: 0, mouse: { x: -9999, y: -9999 }, t: 0 };
  var MQ = window.matchMedia("(max-width: 640px)");

  function sizeCanvas() {
    var hero = $(".hero");
    if (!hero || !canvas) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = hero.offsetWidth * dpr;
    canvas.height = hero.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes(hero.offsetWidth, hero.offsetHeight);
  }

function seedNodes(w, h) {
    var count = MQ.matches ? 38 : Math.min(110, Math.floor(w * h / 16000));
    neural.nodes = [];
    var shapes = [0, 1, 2]; // 0=brain, 1=neuron, 2=medical cross
    for (var i = 0; i < count; i++) {
      neural.nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 2 + Math.random() * 1.2,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
  }

  function drawNeural() {
    if (!canvas) return;
    var w = canvas.width / (Math.min(2, window.devicePixelRatio || 1));
    var h = canvas.height / (Math.min(2, window.devicePixelRatio || 1));
    var pal = themeColors();
    neural.t += 0.016;
    ctx.clearRect(0, 0, w, h);

    var maxD = MQ.matches ? 130 : 170;
    for (var i = 0; i < neural.nodes.length; i++) {
      var a = neural.nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < -5 || a.x > w + 5) a.vx *= -1;
      if (a.y < -5 || a.y > h + 5) a.vy *= -1;
      var dx = neural.mouse.x - a.x, dy = neural.mouse.y - a.y;
      var md = Math.sqrt(dx * dx + dy * dy);
      if (md < 160 && md > 1) { a.x += dx / md * 0.5; a.y += dy / md * 0.5; }

      for (var j = i + 1; j < neural.nodes.length; j++) {
        var b = neural.nodes[j];
        var ddx = a.x - b.x, ddy = a.y - b.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < maxD) {
          var alpha = (1 - d / maxD) * pal.webA;
          ctx.strokeStyle = "rgba(" + pal.web + "," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      drawShape(a, pal);
    }
    drawEEG(w, h, pal);
    if (neural.running) neural.raf = requestAnimationFrame(drawNeural);
  }

  function drawShape(node, pal) {
    var x = node.x, y = node.y, r = Math.max(node.r, 1.5), s = node.shape;
    var col = "rgba(" + pal.node + "," + pal.nodeA + ")";
    var accent = "rgba(" + pal.web + "," + pal.webA + ")";
    ctx.fillStyle = col;
    ctx.globalAlpha = pal.nodeA;
    ctx.beginPath();
    if (s === 0) { // stylized brain: two lobes + sulci
      ctx.moveTo(x, y - r * 0.55);
      ctx.bezierCurveTo(x - r * 0.6, y - r * 0.3, x - r * 0.5, y, x, y + r * 0.3);
      ctx.bezierCurveTo(x + r * 0.5, y, x + r * 0.6, y - r * 0.3, x, y - r * 0.55);
      ctx.lineTo(x, y + r * 0.35);
      ctx.lineTo(x - r * 0.15, y + r * 0.55);
      ctx.lineTo(x + r * 0.15, y + r * 0.55);
      ctx.closePath();

      if (pal.webA > 0.1) {
        for (var i = -1; i <= 1; i += 2) {
          ctx.fillStyle = accent;
          ctx.fillRect(x - r * 0.06, y - r * 0.12, r * 0.12, r * 0.2);
        }
      }
    } else if (s === 1) { // neuron: soma + dendrites + axon
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x - r * 0.3, y - r * 0.2);
      ctx.lineTo(x - r * 0.45, y);
      ctx.lineTo(x - r * 0.3, y + r * 0.2);
      ctx.lineTo(x, y + r * 0.5);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y + r);
      ctx.lineTo(x - r * 0.3, y - r * 0.2);
      ctx.lineTo(x - r * 0.45, y);
      ctx.lineTo(x - r * 0.3, y + r * 0.2);
      ctx.lineTo(x, y + r * 0.5);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + r * 1.2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = r * 0.18;
      ctx.stroke();

      if (pal.webA > 0.1) {
        ctx.fillStyle = accent;
        ctx.fillRect(x - r * 0.03, y, r * 0.06, r * 0.55);
      }
    } else { // medical cross: center dot + cross
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.45);
      ctx.lineTo(x, y + r * 0.45);
      ctx.moveTo(x - r * 0.45, y);
      ctx.lineTo(x + r * 0.45, y);
      ctx.lineWidth = r * 0.2;
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function themeColors() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { web: "125,255,190", node: "125,255,190", nodeA: 0.75, webA: 0.22,
          eeg: "rgba(255,180,84,0.55)", eegGlow: "rgba(255,180,84,0.8)" }
      : { web: "30,144,112", node: "30,144,112", nodeA: 0.55, webA: 0.16,
          eeg: "rgba(180,131,11,0.5)", eegGlow: "rgba(180,131,11,0.55)" };
  }

  function drawEEG(w, h, pal) {
    var y0 = h * 0.86;
    var amp = 16 + Math.sin(neural.t * 0.8) * 5;
    ctx.beginPath();
    for (var x = 0; x <= w; x += 6) {
      var t = x * 0.012 + neural.t * 1.6;
      var y = y0 + Math.sin(t) * amp * 0.3
        + Math.sin(t * 2.7) * amp * 0.5
        + Math.sin(t * 6.3) * amp * 0.16;
      // occasional "spike" (P300-like event)
      var s = (x + neural.t * 90) % (w * 1.4);
      if (s < 26) y -= Math.sin((s / 26) * Math.PI) * 46;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = pal.eeg;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = pal.eegGlow;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function startNeural() {
    if (reducedMotion || neural.running || !canvas) return;
    sizeCanvas();
    neural.running = true;
    neural.raf = requestAnimationFrame(drawNeural);
  }
  function stopNeural() {
    neural.running = false;
    cancelAnimationFrame(neural.raf);
  }

  document.addEventListener("mousemove", function (e) {
    var hero = $(".hero");
    if (!hero || !canvas) return;
    var r = hero.getBoundingClientRect();
    neural.mouse.x = e.clientX - r.left;
    neural.mouse.y = e.clientY - r.top;
  }, { passive: true });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (neural.running) sizeCanvas(); }, 180);
  });

  /* ============================================================
     CUSTOM CURSOR — follows any real mouse (touch stays native)
     ============================================================ */
  if (!reducedMotion) {
    var cur = $("#cursor"), dot = $("#cursorDot");
    var cx = -100, cy = -100, dx2 = -100, dy2 = -100, live = false;
    // pointermove reports the actual device in use, unlike the
    // primary-pointer media query (touchscreen laptops misreport as coarse)
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse") {
        cx = e.clientX; cy = e.clientY;
        if (!live) { live = true; document.body.classList.add("cursor-live"); }
      } else if (live) {
        live = false;
        document.body.classList.remove("cursor-live", "cursor-hot");
      }
    }, { passive: true });
    (function loop() {
      if (live) {
        dx2 += (cx - dx2) * 0.35; dy2 += (cy - dy2) * 0.35;
        cur.style.left = cx + "px"; cur.style.top = cy + "px";
        dot.style.left = dx2 + "px"; dot.style.top = dy2 + "px";
      }
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      var hot = e.target.closest("a, button, .filter, input, select, textarea, [data-tilt]");
      document.body.classList.toggle("cursor-hot", !!hot);
    });
  }

  /* ============================================================
     SONAR CLICK PINGS
     ============================================================ */
  if (!reducedMotion) {
    document.addEventListener("click", function (e) {
      var p = document.createElement("span");
      p.className = "ping";
      p.style.left = e.clientX + "px";
      p.style.top = e.clientY + "px";
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 650);
    });
  }

  /* ============================================================
     TILT CARDS
     ============================================================ */
  if (finePointer && !reducedMotion) {
    $all("[data-tilt]").forEach(function (card) {
      var raf = 0;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform = "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg) translateZ(0)";
        });
      });
      card.addEventListener("mouseleave", function () {
        cancelAnimationFrame(raf);
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  /* ============================================================
     PUBLICATION FILTERS
     ============================================================ */
  $all(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $all(".filter").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var f = btn.dataset.filter;
      $all(".paper").forEach(function (p) {
        var show = f === "all" || p.dataset.cat === f;
        p.classList.toggle("is-hidden", !show);
      });
    });
  });
  // allow deep links like #/publications?filter=thesis later
  function applyPubFilterFromHash() {
    var m = /[?&]filter=(\w+)/.exec(window.location.hash);
    if (!m) return;
    var btn = $('.filter[data-filter="' + m[1] + '"]');
    if (btn) btn.click();
  }

  /* ============================================================
     COLLABORATION FORM → mailto
     ============================================================ */
  var form = $("#coopForm");
  if (form) {
    var field = function (n) { return form.querySelector('[name="' + n + '"]'); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = field("name").value.trim();
      var email = field("email").value.trim();
      var type = field("type").value;
      var msg = field("message").value.trim();
      if (!name || !email || !msg) { $("#formStatus").textContent = "MISSING FIELDS"; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("#formStatus").textContent = "INVALID CHANNEL"; return; }
      var subject = encodeURIComponent("[" + type.toUpperCase() + "] Collaboration — " + name);
      var body = encodeURIComponent("Name / Unit: " + name + "\nReturn channel: " + email + "\nOperation type: " + type + "\n\nBriefing:\n" + msg);
      $("#formStatus").textContent = "TRANSMITTING…";
      window.location.href = "mailto:" + SITE.email + "," + SITE.email2 + "?subject=" + subject + "&body=" + body;
      setTimeout(function () { $("#formStatus").textContent = "CHANNEL OPEN"; }, 1200);
    });
  }

  /* ============================================================
     CONTACT FORM → mailto (both inboxes)
     ============================================================ */
  var cform = $("#contactForm");
  if (cform) {
    var cfield = function (n) { return cform.querySelector('[name="' + n + '"]'); };
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = cfield("name").value.trim();
      var email = cfield("email").value.trim();
      var msg = cfield("message").value.trim();
      if (!name || !email || !msg) { $("#contactStatus").textContent = "MISSING FIELDS"; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("#contactStatus").textContent = "INVALID CHANNEL"; return; }
      var subject = encodeURIComponent("Website contact — " + name);
      var body = encodeURIComponent("Name: " + name + "\nReturn channel: " + email + "\n\nMessage:\n" + msg);
      $("#contactStatus").textContent = "TRANSMITTING…";
      window.location.href = "mailto:" + SITE.email + "," + SITE.email2 + "?subject=" + subject + "&body=" + body;
      setTimeout(function () { $("#contactStatus").textContent = "CHANNEL OPEN"; }, 1200);
    });
  }

  /* ============================================================
     THEME SWITCH (light default, persisted)
     ============================================================ */
  var themeToggle = $("#themeToggle"), themeColorMeta = $("#themeColor");
  function applyTheme(t, silent) {
    if (t !== "dark" && t !== "light") t = "light";
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("naa-theme", t); } catch (e) {}
    var dark = t === "dark";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (themeColorMeta) themeColorMeta.setAttribute("content", dark ? "#050a08" : "#d6d0bd");
    if (!silent) toast(dark ? "NIGHT OPS // DARK THEME" : "DAYLIGHT // LIGHT THEME");
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ============================================================
     HUD: ZULU CLOCK + STATIC META
     ============================================================ */
  var clockEl = $("#railClock");
  function tickClock() {
    if (!clockEl) return;
    var d = new Date();
    var p2 = function (n) { return String(n).padStart(2, "0"); };
    clockEl.textContent = p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()) + ":" + p2(d.getUTCSeconds()) + " Z";
  }
  setInterval(tickClock, 1000); tickClock();

  $("#aboutDate").textContent = new Date().toISOString().slice(0, 10);
  $("#year").textContent = new Date().getFullYear();

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  var topBtn = $("#topBtn");
  window.addEventListener("scroll", function () {
    topBtn.classList.toggle("is-show", window.scrollY > 700);
  }, { passive: true });
  topBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* ============================================================
     EASTER EGG: type "declassify" or triple-click brand
     ============================================================ */
  var keys = "";
  document.addEventListener("keydown", function (e) {
    if (e.key && e.key.length === 1) {
      keys = (keys + e.key.toLowerCase()).slice(-11);
      if (keys === "declassify") toggleDeclassified();
    }
  });
  var brand = $(".nav__brand"), clicks = 0, clickTimer = 0;
  if (brand) {
    brand.addEventListener("click", function () {
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clicks = 0; }, 600);
      if (clicks >= 3) { clicks = 0; toggleDeclassified(); }
    });
  }
  function toggleDeclassified() {
    var on = document.body.classList.toggle("is-declassified");
    toast(on ? "DOSSIER DECLASSIFIED" : "RE-SEALED // CLASSIFIED");
    if (on) setTimeout(function () { document.body.classList.remove("is-declassified"); }, 3200);
  }

  /* ============================================================
     BOUNDARY-SPANNING SIMULATOR (illustrative toy model, client-side only)
     ============================================================ */
  (function () {
    var p = $("#simProto"), ii = $("#simIdentity"), b = $("#simPerm");
    if (!p || !ii || !b) return;
    var dots = $all("#simDots circle");
    var offs = [-1, -0.4, 0.5, 1];
    function setBar(bar, val, num) {
      $("#" + bar).style.width = num + "%";
      $("#" + val).textContent = num;
    }
    function update() {
      var P = +p.value, I = +ii.value, B = +b.value;
      $("#simProtoVal").textContent = P;
      $("#simIdentityVal").textContent = I;
      $("#simPermVal").textContent = B;
      var trust = Math.round(0.45 * P + 0.35 * I + 0.20 * B);
      var coop = Math.round(0.30 * P + 0.50 * I + 0.20 * B);
      var emp = Math.round(0.25 * P + 0.45 * I + 0.30 * B);
      setBar("simTrustBar", "simTrustVal", trust);
      setBar("simCoopBar", "simCoopVal", coop);
      setBar("simEmpBar", "simEmpVal", emp);
      var spread = 46 - I * 0.38;
      dots.forEach(function (d, k) {
        d.setAttribute("cx", (205 + offs[k % offs.length] * spread).toFixed(1));
      });
      $("#simBridge").style.opacity = (0.15 + 0.85 * trust / 100).toFixed(2);
      $("#simSelf").setAttribute("cx", (36 + trust * 0.25).toFixed(1));
    }
    [p, ii, b].forEach(function (el) { el.addEventListener("input", update); });
    update();
  })();

  /* ============================================================
     ANSAH ANSWERS YOU — scripted dossier concierge (no backend)
     ============================================================ */
  (function () {
    var log = $("#askLog"), form = $("#askForm"), input = $("#askInput");
    if (!log || !form || !input) return;
    var INTENTS = [
      { k: ["hello", "hi", "hey", "morning", "afternoon", "evening", "greetings"], a: "Hello, and welcome. I answer straight from Nancy's dossier. Ask me about her research, contact channels, lab, service, CV, or collaborations." },
      { k: ["who", "about", "name", "yourself", "nancy"], a: "Nancy Ansah-Addo is a first-year PhD student in Psychology at the University of Alberta (Rast Lab) and a Personnel Selection Officer in the Canadian Armed Forces." },
      { k: ["research", "phd", "thesis", "study", "studying", "dissertation", "topic"], a: "Her doctoral work studies external appointment and boundary-spanning leadership in the CAF: how leaders from outside a group build trust, cooperation and psychological empowerment across Army, Navy and Air Force boundaries. Try the Boundary-Spanning Simulator on the Research page." },
      { k: ["lab", "rast", "supervisor", "professor", "david"], a: "She works in the Group Processes and Leadership Lab under Dr. David Rast III at the University of Alberta. Lab site: sites.psych.ualberta.ca/rastlab" },
      { k: ["email", "mail", "contact", "reach", "write", "address"], a: "Primary mail: ansahaddonancy@gmail.com. University mail: ansahadd@ualberta.ca. Direct line: +1 306-807-9001. Or use the transmission form on this page and it opens your mail app addressed to both inboxes." },
      { k: ["phone", "call", "number", "tel", "mobile"], a: "Direct line: +1 306-807-9001." },
      { k: ["where", "based", "location", "live", "edmonton", "city"], a: "Edmonton, Alberta, Canada, serving with 3rd Canadian Division Support Base (3 CDSB)." },
      { k: ["branch", "unit", "caf", "military", "army", "pso", "officer", "rank", "service", "soldier", "forces"], a: "Personnel Selection Officer (PSEL Branch), serving with 3 CDSB Edmonton. PSOs apply behavioural science to selection, leadership and personnel research across the Canadian Armed Forces." },
      { k: ["cv", "resume", "dossier", "download"], a: "Use the REQUEST CV button on this page and it opens a pre-addressed mail to her Gmail. She aims to respond within 48 hours." },
      { k: ["paper", "publication", "publish", "article", "manuscript"], a: "Two theses (Copenhagen 2020, Ghana 2019), manuscripts on child eyewitness testimony and psychometric scale adaptation, plus a 2012 seminar talk. Full list on the Papers page." },
      { k: ["teach", "course", "class", "student", "lecture"], a: "Teaching Assistant experience at Copenhagen and Ghana, focused on small-group instruction and mentoring in research methods. Details on the Teaching page." },
      { k: ["collaborat", "work together", "partner", "supervis", "project", "join"], a: "She is open to joint operations worldwide: co-supervision, leadership and intergroup research, and data partnerships. Use the form on the Collaborations page and it reaches both her inboxes." },
      { k: ["social", "linkedin", "github", "researchgate", "profile"], a: "Find her on the Social page: LinkedIn, ResearchGate and GitHub profiles, all linked and clickable." },
      { k: ["language", "speak", "french", "english"], a: "English, and beginner French." },
      { k: ["thank", "thanks", "great", "awesome"], a: "Anytime. Anything else from the dossier?" }
    ];
    var FALLBACK = "I only answer from Nancy's published dossier, and that one sits outside it. Try asking about her research, contact channels, lab, service, CV, or collaborations.";
    function addMsg(text, who) {
      var d = document.createElement("div");
      d.className = "ask__msg ask__msg--" + who;
      d.textContent = text;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }
    function answer(q) {
      var t = " " + q.toLowerCase() + " ";
      var best = null, bestHits = 0;
      INTENTS.forEach(function (it) {
        var hits = 0;
        it.k.forEach(function (k) { if (t.indexOf(k) !== -1) hits++; });
        if (hits > bestHits) { bestHits = hits; best = it; }
      });
      return best ? best.a : FALLBACK;
    }
    function respond(q) {
      addMsg(q, "user");
      input.value = "";
      var reply = answer(q);
      if (reducedMotion) { addMsg(reply, "bot"); return; }
      var tp = addMsg("Consulting dossier…", "bot");
      tp.classList.add("ask__msg--typing");
      setTimeout(function () { tp.textContent = reply; tp.classList.remove("ask__msg--typing"); }, 650);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (q) respond(q);
    });
    $all("[data-ask]").forEach(function (chip) {
      chip.addEventListener("click", function () { respond(chip.getAttribute("data-ask")); });
    });
    addMsg("Ansah Answers You, online. I answer from Nancy's dossier only. Tap a topic above or type your question.", "bot");
  })();

  /* ============================================================
     INIT
     ============================================================ */
  runBoot();
  if (!window.location.hash) history.replaceState(null, "", "#/");
  navigate();
  applyPubFilterFromHash();
  observeReveals();
  typewriter();
  window.addEventListener("hashchange", applyPubFilterFromHash);
})();

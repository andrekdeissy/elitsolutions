/* ============================================================
   elIT Solutions — Interactions
   ============================================================ */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle (default light, persisted) ---------- */
  var root = document.documentElement;
  var THEME_KEY = "elit-theme";
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
      b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
    window.dispatchEvent(new Event("themechange"));
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(savedTheme || root.getAttribute("data-theme") || "light");
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  });

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var body = document.body;
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  function revealAll() { revealEls.forEach(function (el) { el.classList.remove("from-top"); el.classList.add("in"); }); }
  if ("IntersectionObserver" in window && !reduceMotion) {
    // Bidirectional: reveal on enter, reset on exit so it re-animates.
    // Direction depends on which edge the element sits on — elements above the
    // viewport re-enter from the top (descend), elements below rise from the bottom.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.remove("from-top");
          el.classList.add("in");
        } else {
          el.classList.remove("in");
          if (entry.boundingClientRect.top < 0) el.classList.add("from-top");
          else el.classList.remove("from-top");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety net: if the page loaded hidden/throttled and nothing revealed,
    // never leave content permanently invisible.
    window.addEventListener("load", function () {
      setTimeout(function () {
        if (!document.querySelector("[data-reveal].in")) revealAll();
      }, 2500);
    });
  } else {
    revealAll();
  }

  /* ---------- Card cursor spotlight + 3D tilt ---------- */
  if (!reduceMotion && window.matchMedia("(hover:hover)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointerenter", function () {
        card.style.transform = "perspective(1000px) translateY(-8px)";
      });
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(1000px) translateY(-8px) rotateX(" + (-py * 5).toFixed(2) +
          "deg) rotateY(" + (px * 5).toFixed(2) + "deg)";
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Hero parallax ---------- */
  var orb = document.querySelector(".hero-orb");
  if (orb && !reduceMotion) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      orb.style.transform = "translateY(" + (y * 0.12) + "px)";
    }, { passive: true });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Contact form ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setInvalid(field, invalid) {
      var wrap = field.closest(".field");
      if (wrap) wrap.classList.toggle("invalid", invalid);
    }

    form.querySelectorAll("[required]").forEach(function (f) {
      f.addEventListener("input", function () { setInvalid(f, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var valid = f.value.trim() !== "";
        if (f.type === "email") valid = emailRe.test(f.value.trim());
        setInvalid(f, !valid);
        if (!valid && ok) { ok = false; f.focus(); }
      });
      if (!ok) return;

      var btn = form.querySelector("button[type=submit]");
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      // Front-end demo submission. Wire to a real endpoint / mailto / CRM as needed.
      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (status) {
          status.classList.add("show", "ok");
          status.textContent = "Thank you — your message has been received. Our team will reach out within one business day.";
          status.setAttribute("role", "status");
          status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
      }, 900);
    });
  }

  /* ---------- Neural network canvas background ---------- */
  var canvas = document.getElementById("neural-canvas");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var w, h, dpr, nodes = [], raf, mouse = { x: -9999, y: -9999 };
    var COUNT, MAXD;

    // Line/node colors follow the active theme (rgb triplets from CSS tokens)
    var COL = { line: "96,150,255", node: "140,180,255", mouse: "34,211,238" };
    function refreshColors() {
      var cs = getComputedStyle(document.documentElement);
      COL.line = (cs.getPropertyValue("--net-line") || COL.line).trim();
      COL.node = (cs.getPropertyValue("--net-node") || COL.node).trim();
      COL.mouse = (cs.getPropertyValue("--net-mouse") || COL.mouse).trim();
    }
    refreshColors();
    window.addEventListener("themechange", refreshColors);

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      var area = window.innerWidth * window.innerHeight;
      COUNT = Math.max(28, Math.min(80, Math.floor(area / 22000)));
      MAXD = (window.innerWidth < 700 ? 120 : 165) * dpr;
      seed();
    }
    function seed() {
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28 * dpr,
          vy: (Math.random() - 0.5) * 0.28 * dpr,
          r: (Math.random() * 1.6 + 0.6) * dpr
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAXD) {
            var a = (1 - dist / MAXD) * 0.5;
            ctx.strokeStyle = "rgba(" + COL.line + "," + a + ")";
            ctx.lineWidth = dpr * 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        // mouse link
        var mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        var md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < MAXD * 1.4) {
          var ma = (1 - md / (MAXD * 1.4)) * 0.5;
          ctx.strokeStyle = "rgba(" + COL.mouse + "," + ma + ")";
          ctx.lineWidth = dpr * 0.7;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        var grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
        grd.addColorStop(0, "rgba(" + COL.node + ",0.9)");
        grd.addColorStop(1, "rgba(" + COL.node + ",0)");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
    }, { passive: true });
    window.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(size, 200);
    });

    // Pause when tab hidden; re-measure and resume when it returns
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { size(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    });
    // Re-measure once fully loaded (handles load-while-hidden / late layout)
    window.addEventListener("load", function () {
      if (window.innerWidth && canvas.width !== Math.floor(window.innerWidth * (Math.min(window.devicePixelRatio || 1, 2)))) size();
    });

    size();
    draw();
  }
})();

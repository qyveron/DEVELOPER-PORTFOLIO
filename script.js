(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Footer year */
  $("#year").textContent = new Date().getFullYear();

  /* Mobile navigation */
  var menuBtn = $(".menu-btn");
  var nav = $("#nav");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  }
  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });

  /* Scroll progress and header border */
  var bar = $(".progress");
  var header = $(".site-header");
  var ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    header.classList.toggle("scrolled", window.scrollY > 10);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* Active nav link and scroll reveal */
  if ("IntersectionObserver" in window) {
    var links = {};
    $$(".nav a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          $$(".nav a.active").forEach(function (a) { a.classList.remove("active"); });
          links[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });

    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { revealer.observe(el); });

    /* Load live previews only when near the viewport */
    var framer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var f = en.target;
          f.src = f.getAttribute("data-src");
          obs.unobserve(f);
        }
      });
    }, { rootMargin: "300px" });
    $$("iframe[data-src]").forEach(function (f) { framer.observe(f); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    $$("iframe[data-src]").forEach(function (f) { f.src = f.getAttribute("data-src"); });
  }

  /* Scale live previews to fit their frame */
  function scaleFrames() {
    $$(".frame-view").forEach(function (v) {
      var f = $("iframe", v);
      f.style.transform = "scale(" + v.clientWidth / 1280 + ")";
    });
  }
  scaleFrames();
  window.addEventListener("resize", scaleFrames);

  /* Subtle 3D tilt */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (el) {
      var max = el.classList.contains("card") ? 9 : 4;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("is-tilting");
        el.style.setProperty("--ry", (x * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-y * max).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* Interactive skills */
  var note = $("#skillNote");
  var skills = $$(".skill");
  skills.forEach(function (btn) {
    function select() {
      skills.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      note.textContent = btn.getAttribute("data-note");
    }
    btn.addEventListener("click", select);
    btn.addEventListener("mouseenter", function () { if (finePointer) select(); });
    btn.addEventListener("focus", select);
  });

  /* Copy email */
  var copyBtn = $("#copyEmail");
  var status = $("#copyStatus");
  var email = "vis830066@gmail.com";
  function done(msg) {
    status.textContent = msg;
    copyBtn.textContent = msg;
    setTimeout(function () { copyBtn.textContent = "Copy email address"; }, 2200);
  }
  copyBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { done("Email copied"); }, function () { done(email); });
    } else {
      done(email);
    }
  });
})();
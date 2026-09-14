/* Nexo Hunters — minimal progressive enhancement.
   The page is fully readable and navigable with JS disabled; this only adds
   the mobile nav toggle. */
(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  var label = toggle.querySelector(".visually-hidden");
  // Strings live in the markup so this file stays shared across languages.
  var openLabel = toggle.getAttribute("data-label-open") || "";
  var closeLabel = toggle.getAttribute("data-label-close") || "";

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? closeLabel : openLabel;
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close after picking a destination.
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Dropping back to the desktop layout must not leave the panel state stuck.
  var wide = window.matchMedia("(min-width: 861px)");
  var onChange = function (event) { if (event.matches) setOpen(false); };
  if (wide.addEventListener) wide.addEventListener("change", onChange);
  else if (wide.addListener) wide.addListener(onChange);
})();

/* Process deck — folds each step away to reveal the next one.

   Progressive enhancement, deliberately: the markup is untouched, so with JS
   off, with prefers-reduced-motion, or on a narrow viewport the section keeps
   the CSS-only sticky stack it shipped with. The wrappers this needs are built
   here rather than in the HTML, which also means both language pages are
   covered without duplicating anything. */
(function () {
  "use strict";

  var stack = document.querySelector(".process__stack");
  if (!stack) return;

  var steps = Array.prototype.slice.call(stack.querySelectorAll(".step"));
  if (steps.length < 2) return;

  // Tunables — the scroll cost of the section is SEGMENT x (steps - 1).
  var SEGMENT = 0.72;   // viewport heights of scroll per departing card
  var LIFT = 118;       // % of its own height the departing card travels up
  var TILT = 20;        // deg it folds back as it goes
  var DEPTH_Y = 12;     // px each waiting card sits below the one in front
  var DEPTH_S = 0.022;  // scale step per depth level
  var MAX_DEPTH = 3;    // stop shrinking cards further back than this

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 861px)");

  var pin = null, deck = null, built = false;
  var startY = 0, spanY = 1, ticking = false;

  function build() {
    if (built) return;
    pin = document.createElement("div");
    pin.className = "process__pin";
    deck = document.createElement("div");
    deck.className = "process__deck";
    steps.forEach(function (s) { deck.appendChild(s); });
    pin.appendChild(deck);
    stack.appendChild(pin);
    stack.classList.add("is-deck");
    built = true;
  }

  function teardown() {
    if (!built) return;
    steps.forEach(function (s) {
      s.style.transform = "";
      s.style.zIndex = "";
      stack.appendChild(s);
    });
    if (pin.parentNode) pin.parentNode.removeChild(pin);
    stack.classList.remove("is-deck");
    stack.style.height = "";
    pin = deck = null;
    built = false;
  }

  function measure() {
    if (!built) return;
    // The deck is as tall as its tallest card, so nothing gets clipped.
    stack.style.height = "auto";
    deck.style.height = "auto";
    var tallest = 0;
    steps.forEach(function (s) {
      s.style.transform = "none";
      tallest = Math.max(tallest, s.offsetHeight);
    });
    deck.style.height = tallest + "px";
    deck.style.width = "100%";

    spanY = Math.max(1, Math.round(window.innerHeight * SEGMENT) * (steps.length - 1));
    stack.style.height = pin.offsetHeight + spanY + "px";

    startY = stack.getBoundingClientRect().top + window.scrollY;
    render();
  }

  function render() {
    if (!built) return;
    var t = (window.scrollY - startY) / spanY;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var p = t * (steps.length - 1);

    for (var i = 0; i < steps.length; i++) {
      var el = steps[i], transform;
      if (i <= p) {
        // Departing (or gone): fold back and lift off the top.
        var gone = Math.min(1, p - i);
        transform = "translateY(" + (-LIFT * gone).toFixed(2) + "%) rotateX(" +
          (TILT * gone).toFixed(2) + "deg)";
      } else {
        // Waiting underneath: sit slightly lower and smaller.
        var d = Math.min(MAX_DEPTH, i - p);
        transform = "translateY(" + (DEPTH_Y * d).toFixed(2) + "px) scale(" +
          (1 - DEPTH_S * d).toFixed(4) + ")";
      }
      el.style.transform = transform;
      el.style.zIndex = String(steps.length - i);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; render(); });
  }

  function sync() {
    var on = wide.matches && !reduce.matches;
    if (on && !built) { build(); measure(); }
    else if (!on && built) { teardown(); }
    else if (on) { measure(); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", sync);
  if (wide.addEventListener) {
    wide.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
  }
  // Fonts land after first paint and change card heights.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  window.addEventListener("load", sync);
  sync();
})();

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

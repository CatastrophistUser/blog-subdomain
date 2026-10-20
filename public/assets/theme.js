// Theme for standalone posts. Load it in <head> (not deferred) so the theme applies before first paint.
// Shares the "theme" key with the main blog, so a visitor's choice carries across.
(function () {
  var root = document.documentElement;
  var theme = "dark";
  try {
    theme = localStorage.getItem("theme") || "dark";
  } catch (_) {}
  root.dataset.theme = theme;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", "Switch to " + (root.dataset.theme === "dark" ? "light" : "dark") + " theme");
      btn.addEventListener("click", function () {
        var next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        btn.setAttribute("aria-label", "Switch to " + (next === "dark" ? "light" : "dark") + " theme");
        try {
          localStorage.setItem("theme", next);
        } catch (_) {}
      });
    });
  });
})();

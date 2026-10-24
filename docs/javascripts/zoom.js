/*
 * Mirai docs: click-to-zoom for diagrams and screenshots.
 * Any image with the class "zoomable", or inside .mi-phones / .mi-desktops,
 * opens full screen. Works with Material's instant navigation (document$).
 */
(function () {
  var SELECTOR = "img.zoomable, .mi-phones img, .mi-desktops img";

  function open(img) {
    var box = document.createElement("div");
    box.className = "mi-lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", img.alt || "Image preview");

    var close = document.createElement("button");
    close.className = "mi-lightbox__close";
    close.type = "button";
    close.setAttribute("aria-label", "Close preview");
    close.innerHTML = "&times;";

    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";

    box.appendChild(close);
    box.appendChild(big);

    if (img.alt) {
      var cap = document.createElement("div");
      cap.className = "mi-lightbox__caption";
      cap.textContent = img.alt;
      box.appendChild(cap);
    }

    function dismiss() {
      box.remove();
      document.removeEventListener("keydown", onKey);
      img.focus({ preventScroll: true });
    }

    function onKey(e) {
      if (e.key === "Escape") dismiss();
    }

    close.addEventListener("click", dismiss);
    box.addEventListener("click", function (e) {
      if (e.target === box) dismiss();
    });
    document.addEventListener("keydown", onKey);

    document.body.appendChild(box);
    close.focus();
  }

  function bind() {
    document.querySelectorAll(SELECTOR).forEach(function (img) {
      if (img.dataset.miZoom) return;
      img.dataset.miZoom = "1";
      img.setAttribute("tabindex", "0");
      img.addEventListener("click", function () { open(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(img);
        }
      });
    });
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(bind);
  } else {
    document.addEventListener("DOMContentLoaded", bind);
  }
})();

/* Image viewer for the Mirai docs.
 *
 * - Any img.zoomable, and every image in .mi-phones / .mi-desktops / .mi-figure
 *   galleries, gets an "Enlarge" badge and opens in a full-screen viewer.
 * - The viewer fits the image to the screen; "Zoom in" (or a click on the
 *   image) enlarges it up to its full resolution, and it can then be dragged or scrolled.
 * - Images in the same gallery can be browsed with the arrows, ← → keys or a swipe.
 * - Esc, the close button or a click on the backdrop closes it, and focus
 *   returns to the image that opened it.
 * - Works with Material's instant navigation (document$).
 */
(function () {
  "use strict";

  var SELECTOR = "img.zoomable, .mi-phones img, .mi-desktops img, .mi-figure img";
  var GROUP = ".mi-phones, .mi-desktops, .mi-figure";
  var ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6h-2V6.41l-4.29 4.3-1.42-1.42L17.59 5H15V3zM3 15h2v2.59l4.29-4.3 1.42 1.42L6.41 19H9v2H3v-6z"/></svg>';

  function captionFor(img) {
    var fig = img.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    var title = "";
    if (cap) {
      var c = cap.cloneNode(true);
      c.querySelectorAll("a").forEach(function (a) { a.remove(); });
      title = c.textContent.replace(/\s+/g, " ").trim();
    }
    var alt = (img.getAttribute("alt") || "").trim();
    return { title: title || alt, detail: title && alt && alt !== title ? alt : "" };
  }

  function groupOf(img) {
    var root = img.closest(GROUP);
    if (!root) return [img];
    // A gallery is the grid itself; consecutive figures belong together.
    return Array.prototype.slice.call(root.querySelectorAll("img")).filter(function (i) {
      return i.matches(SELECTOR);
    });
  }

  function bestSrc(img) {
    return img.getAttribute("data-full") || img.currentSrc || img.src;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function open(startImg) {
    var items = groupOf(startImg);
    var index = Math.max(0, items.indexOf(startImg));
    var opener = startImg;

    var box = el("div", "mi-lightbox");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");

    var bar = el("div", "mi-lightbox__bar");
    var count = el("span", "mi-lightbox__count");
    var zoomBtn = el("button", "mi-lightbox__btn mi-lightbox__btn--zoom", ICON + "<span>&nbsp;Zoom in</span>");
    zoomBtn.type = "button";
    zoomBtn.setAttribute("aria-pressed", "false");
    var openBtn = el("a", "mi-lightbox__btn", "Open image");
    openBtn.target = "_blank";
    openBtn.rel = "noopener";
    var closeBtn = el("button", "mi-lightbox__btn mi-lightbox__btn--close", "&times;");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close (Esc)");
    bar.appendChild(count);
    bar.appendChild(zoomBtn);
    bar.appendChild(openBtn);
    bar.appendChild(closeBtn);

    var stage = el("div", "mi-lightbox__stage");
    var spinner = el("div", "mi-lightbox__spinner");
    var big = document.createElement("img");
    big.decoding = "async";
    stage.appendChild(spinner);
    stage.appendChild(big);

    var caption = el("div", "mi-lightbox__caption");
    caption.id = "mi-lb-caption";
    box.setAttribute("aria-labelledby", "mi-lb-caption");

    box.appendChild(bar);
    box.appendChild(stage);
    box.appendChild(caption);

    var prev, next;
    if (items.length > 1) {
      prev = el("button", "mi-lightbox__btn mi-lightbox__nav mi-lightbox__nav--prev", "&#8249;");
      next = el("button", "mi-lightbox__btn mi-lightbox__nav mi-lightbox__nav--next", "&#8250;");
      prev.type = next.type = "button";
      prev.setAttribute("aria-label", "Previous image");
      next.setAttribute("aria-label", "Next image");
      box.appendChild(prev);
      box.appendChild(next);
      prev.addEventListener("click", function () { show(index - 1); });
      next.addEventListener("click", function () { show(index + 1); });
    }

    function setActual(on) {
      // Measure the fitted size before switching modes.
      var fitted = big.getBoundingClientRect().width || stage.clientWidth;
      box.classList.toggle("is-actual", on);
      zoomBtn.setAttribute("aria-pressed", on ? "true" : "false");
      zoomBtn.lastChild.innerHTML = on ? "&nbsp;Fit to screen" : "&nbsp;Zoom in";
      big.style.cursor = on ? "grab" : "zoom-in";
      if (on) {
        // Up to the image's real pixels, never more than 2.5x the fitted size.
        big.style.width = Math.round(Math.min(big.naturalWidth, Math.max(fitted * 2.5, stage.clientWidth))) + "px";
        stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
        stage.scrollTop = 0;
      } else {
        big.style.width = "";
      }
    }

    function canZoom() {
      // Only offer "actual size" when the image is bigger than the screen area.
      return big.naturalWidth > stage.clientWidth + 8 || big.naturalHeight > stage.clientHeight + 8;
    }

    function show(i) {
      index = (i + items.length) % items.length;
      var img = items[index];
      var cap = captionFor(img);
      setActual(false);
      spinner.style.display = "";
      big.style.visibility = "hidden";
      big.alt = img.getAttribute("alt") || "";
      big.onload = function () {
        spinner.style.display = "none";
        big.style.visibility = "";
        zoomBtn.hidden = !canZoom();
      };
      big.onerror = function () {
        spinner.style.display = "none";
        caption.textContent = "This image could not be loaded.";
      };
      big.src = bestSrc(img);
      openBtn.href = bestSrc(img);
      count.textContent = items.length > 1 ? index + 1 + " / " + items.length : "";
      caption.innerHTML = "";
      caption.appendChild(document.createTextNode(cap.title));
      if (cap.detail) {
        var small = document.createElement("small");
        small.textContent = cap.detail;
        caption.appendChild(small);
      }
      opener = img;
    }

    // Drag to pan when shown at actual size.
    var drag = null;
    stage.addEventListener("pointerdown", function (e) {
      if (!box.classList.contains("is-actual") || e.target !== big) return;
      drag = { x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop, moved: false };
      box.classList.add("is-dragging");
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      stage.scrollLeft = drag.l - dx;
      stage.scrollTop = drag.t - dy;
    });
    function endDrag() {
      box.classList.remove("is-dragging");
      setTimeout(function () { drag = null; }, 0);
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    big.addEventListener("click", function () {
      if (drag && drag.moved) return;
      if (canZoom()) setActual(!box.classList.contains("is-actual"));
    });
    zoomBtn.addEventListener("click", function () { setActual(!box.classList.contains("is-actual")); });

    // Swipe left/right between gallery images (only when fitted).
    var touch = null;
    stage.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1 && !box.classList.contains("is-actual")) touch = e.touches[0].clientX;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (touch == null || items.length < 2) return;
      var dx = e.changedTouches[0].clientX - touch;
      touch = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });

    function close() {
      box.remove();
      document.documentElement.classList.remove("mi-lb-open");
      document.removeEventListener("keydown", onKey, true);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" && items.length > 1 && !box.classList.contains("is-actual")) show(index + 1);
      else if (e.key === "ArrowLeft" && items.length > 1 && !box.classList.contains("is-actual")) show(index - 1);
      else if (e.key === "Tab") {
        // Keep focus inside the viewer.
        var f = Array.prototype.slice.call(box.querySelectorAll("button:not([hidden]), a[href]"));
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    closeBtn.addEventListener("click", close);
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === stage || e.target === caption) close();
    });
    document.addEventListener("keydown", onKey, true);

    document.documentElement.classList.add("mi-lb-open");
    document.body.appendChild(box);
    show(index);
    closeBtn.focus();
  }

  function bind() {
    document.querySelectorAll(SELECTOR).forEach(function (img) {
      if (img.dataset.miZoom) return;
      img.dataset.miZoom = "1";
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Enlarge: " + (captionFor(img).title || "image"));
      if (!img.hasAttribute("loading") && !img.closest(".mi-hero")) img.setAttribute("loading", "lazy");
      img.decoding = "async";

      // Badge wrapper (skip if the image sits in a link).
      if (!img.closest("a") && !img.parentElement.classList.contains("mi-zoom")) {
        var wrap = el("span", "mi-zoom");
        if (img.classList.contains("zoomable")) wrap.classList.add("mi-zoom--block");
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
        var badge = el("span", "mi-zoom__badge", ICON + "Enlarge");
        badge.setAttribute("aria-hidden", "true");
        wrap.appendChild(badge);
      }

      img.addEventListener("click", function (e) {
        e.preventDefault();
        open(img);
      });
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
  } else if (document.readyState !== "loading") {
    bind();
  } else {
    document.addEventListener("DOMContentLoaded", bind);
  }
})();

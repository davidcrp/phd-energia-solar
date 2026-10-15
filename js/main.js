/* =========================================================
   Energia Solar — interações
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal ao rolar ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- FAQ: um item aberto por vez ---------- */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ---------- Carrosséis ----------
     Um mesmo comportamento serve os dois blocos (resultados e
     avaliações); só mudam os ids e a classe do card. */
  function initCarousel(prefix, cardSelector) {
    var track = document.getElementById(prefix + "Track");
    var viewport = document.getElementById(prefix + "Viewport");
    var prev = document.getElementById(prefix + "Prev");
    var next = document.getElementById(prefix + "Next");
    var dotsBox = document.getElementById(prefix + "Dots");

    if (!track || !viewport || !prev || !next) return;

    var index = 0;

    function step() {
      var card = track.querySelector(cardSelector);
      if (!card) return 0;
      var gap = parseFloat(getComputedStyle(track).columnGap || "20") || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function maxIndex() {
      var s = step();
      if (!s) return 0;
      var visible = Math.max(1, Math.round(viewport.getBoundingClientRect().width / s));
      return Math.max(0, track.children.length - visible);
    }

    function buildDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = "";
      for (var i = 0; i <= maxIndex(); i++) {
        (function (i) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Ir para o slide " + (i + 1));
          b.addEventListener("click", function () { index = i; render(); });
          dotsBox.appendChild(b);
        })(i);
      }
    }

    function render() {
      index = Math.min(Math.max(index, 0), maxIndex());
      track.style.transform = "translateX(" + -index * step() + "px)";
      prev.style.opacity = index === 0 ? "0.4" : "1";
      next.style.opacity = index >= maxIndex() ? "0.4" : "1";
      if (dotsBox) {
        [].forEach.call(dotsBox.children, function (d, i) {
          d.classList.toggle("is-active", i === index);
        });
      }
    }

    prev.addEventListener("click", function () { index = index <= 0 ? maxIndex() : index - 1; render(); });
    next.addEventListener("click", function () { index = index >= maxIndex() ? 0 : index + 1; render(); });

    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { buildDots(); render(); }, 150);
    });

    buildDots();
    render();
    window.addEventListener("load", function () { buildDots(); render(); });
  }

  initCarousel("res", ".result-card");
  initCarousel("rev", ".review-card");

  /* ---------- Formulários de proposta ----------
     Validação apenas no cliente. Não há endpoint configurado:
     conectar a um serviço real (e-mail, CRM ou API) antes de publicar. */
  document.querySelectorAll(".quote-form").forEach(function (form) {
    var status = form.querySelector(".quote-form__status");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;

      form.querySelectorAll("input[required], select[required]").forEach(function (input) {
        var field = input.closest(".field");
        var valid = input.value.trim() !== "";
        if (valid && input.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        if (field) field.classList.toggle("is-invalid", !valid);
        if (!valid && ok) { input.focus(); ok = false; }
      });

      if (!ok) {
        if (status) status.textContent = "Preencha os campos destacados para continuar.";
        return;
      }

      if (status) {
        status.textContent = "Formulário válido. Falta conectar o envio a um destino real.";
      }
    });

    form.querySelectorAll("input, select").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("is-invalid");
      });
    });
  });

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMobileNavigation() {
    var button = document.querySelector("[data-mobile-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      var expanded = panel.classList.contains("is-open");
      button.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var activeIndex = 0;
    var intervalId = null;

    function activate(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
        dot.setAttribute("aria-pressed", dotIndex === activeIndex ? "true" : "false");
      });
    }

    function start() {
      stop();
      intervalId = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupMovieFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]"));
    if (!inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute("data-filter-scope");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

      function filterCards() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", filterCards);
      filterCards();
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupMovieFilters();
  });
})();

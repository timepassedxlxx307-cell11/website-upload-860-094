document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-arrow.prev");
  var next = document.querySelector(".hero-arrow.next");
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector(".js-search");
  var categorySelect = document.querySelector(".js-category-filter");
  var yearSelect = document.querySelector(".js-year-filter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

  function filterCards() {
    var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var category = categorySelect ? categorySelect.value : "";
    var year = yearSelect ? yearSelect.value : "";

    cards.forEach(function (card) {
      var haystack = card.getAttribute("data-search") || "";
      var cardCategory = card.getAttribute("data-category") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var ok = true;

      if (term && haystack.indexOf(term) === -1) {
        ok = false;
      }

      if (category && cardCategory !== category) {
        ok = false;
      }

      if (year && cardYear !== year) {
        ok = false;
      }

      card.classList.toggle("is-hidden-card", !ok);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);

    try {
      var params = new URLSearchParams(window.location.search);
      var keyword = params.get("q");
      if (keyword) {
        searchInput.value = keyword;
        filterCards();
      }
    } catch (error) {
      filterCards();
    }
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", filterCards);
  }
});

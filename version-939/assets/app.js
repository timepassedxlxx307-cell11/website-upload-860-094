(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function applyGridFilter(selector) {
    var grid = document.querySelector(selector);
    if (!grid) {
      return;
    }

    var searchInput = document.querySelector('[data-search-input="' + selector + '"]');
    var yearSelect = document.querySelector('[data-year-filter="' + selector + '"]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function update() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-keywords')
        ].join(' '));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-filtered-out', !(matchKeyword && matchYear));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', update);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', update);
    }
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    applyGridFilter(input.getAttribute('data-search-input'));
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }
})();

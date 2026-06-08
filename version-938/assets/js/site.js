(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function() {
    var navToggle = document.querySelector("[data-nav-toggle]");
    if (navToggle) {
      navToggle.addEventListener("click", function() {
        document.body.classList.toggle("nav-open");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    document.querySelectorAll("[data-hero-slider]").forEach(function(slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
      function start() {
        if (timer || slides.length < 2) {
          return;
        }
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }
      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
          if (timer) {
            window.clearInterval(timer);
            timer = null;
          }
          start();
        });
      });
      start();
    });

    document.querySelectorAll("[data-filter-area]").forEach(function(area) {
      var root = area.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      }
      var buttons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-value]"));
      var input = area.querySelector("[data-local-search]");
      var empty = root.querySelector("[data-empty-result]") || document.querySelector("[data-empty-result]");
      var activeFilter = "all";

      function apply() {
        var term = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function(card) {
          var text = normalize(card.getAttribute("data-text"));
          var type = normalize(card.getAttribute("data-type"));
          var year = normalize(card.getAttribute("data-year"));
          var filter = normalize(activeFilter);
          var matchesFilter = filter === "all" || text.indexOf(filter) > -1 || type.indexOf(filter) > -1 || year === filter;
          var matchesTerm = !term || text.indexOf(term) > -1;
          var show = matchesFilter && matchesTerm;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      buttons.forEach(function(button) {
        button.addEventListener("click", function() {
          buttons.forEach(function(item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = button.getAttribute("data-filter-value") || "all";
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", apply);
      }

      if (input && input.hasAttribute("data-search-input")) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
          input.value = query;
        }
      }

      apply();
    });
  });

  window.FirstPlayer = {
    init: function(root, url) {
      var video = root.querySelector("video");
      var cover = root.querySelector(".player-cover");
      var started = false;
      var hls = null;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function() {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }

      function start() {
        if (started || !video || !url) {
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          return;
        }
        video.src = url;
        playVideo();
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function() {
          if (!started) {
            start();
          }
        });
        video.addEventListener("play", function() {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
      }
      root.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
          start();
        }
      });
    }
  };
})();

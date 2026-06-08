document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initCardFilter();
  initHeroCarousel();
  initSearchPage();
});

function initMobileMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", function () {
    panel.classList.toggle("open");
    toggle.classList.toggle("open");
  });
}

function initCardFilter() {
  var input = document.querySelector("[data-card-filter]");
  var list = document.querySelector("[data-card-list]");
  if (!input || !list) {
    return;
  }
  var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
  input.addEventListener("input", function () {
    var keyword = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      card.hidden = keyword && haystack.indexOf(keyword) === -1;
    });
  });
}

function initHeroCarousel() {
  var carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    return;
  }
  var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function play() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      play();
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", play);
  show(0);
  play();
}

function initSearchPage() {
  var data = window.SITE_SEARCH_DATA;
  var results = document.querySelector("[data-search-results]");
  var status = document.querySelector("[data-search-status]");
  var input = document.querySelector("[data-search-input]");
  if (!data || !results || !status || !input) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  input.value = query;

  function render(keyword) {
    var q = keyword.trim().toLowerCase();
    var matched = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine
      ].join(" ").toLowerCase();
      return !q || haystack.indexOf(q) !== -1;
    }).slice(0, 120);

    status.textContent = q ? "搜索结果" : "热门内容";
    results.innerHTML = matched.map(renderSearchCard).join("");
  }

  function renderSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.link) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span><span class=\"play-chip\">播放</span></a>" +
      "<div class=\"card-body\"><div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.link) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  input.addEventListener("input", function () {
    render(input.value);
  });
  render(query);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var cover = document.getElementById(config.coverId);
  var button = document.getElementById(config.buttonId);
  if (!video || !cover || !button || !config.source) {
    return;
  }

  var ready = false;
  var hls = null;

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;
    video.poster = config.poster || video.poster;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(config.source);
      hls.attachMedia(video);
      return;
    }

    video.src = config.source;
  }

  function start() {
    prepare();
    cover.classList.add("is-hidden");
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        cover.classList.remove("is-hidden");
      });
    }
  }

  cover.addEventListener("click", start);
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    start();
  });
  video.addEventListener("play", function () {
    cover.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0) {
      cover.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

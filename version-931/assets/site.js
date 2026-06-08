(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var siteNav = document.querySelector('.site-nav');
    if (navToggle && siteNav) {
      navToggle.addEventListener('click', function () {
        var open = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var next = hero.querySelector('[data-hero-next]');
      var prev = hero.querySelector('[data-hero-prev]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function play() {
        stop();
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          play();
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          play();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          play();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', play);
      show(0);
      play();
    });

    document.querySelectorAll('[data-page-filter]').forEach(function (input) {
      var target = input.getAttribute('data-page-filter');
      var cards = Array.prototype.slice.call(document.querySelectorAll(target));
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
        });
      });
    });
  });
})();

function initMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var started = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function start() {
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(function () {});
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = streamUrl;
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });
}

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var form = document.querySelector('[data-live-search]');
    var results = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');
    if (!form || !results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var input = form.querySelector('[name="q"]');
    var type = form.querySelector('[name="type"]');
    var year = form.querySelector('[name="year"]');
    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function card(item) {
      return '<article class="movie-card" data-movie-card>' +
        '<a class="movie-cover" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="movie-badge">' + escapeHtml(item.year) + '</span>' +
        '<span class="movie-play">▶</span>' +
        '</a>' +
        '<div class="movie-body">' +
        '<a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
        '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
        '<p>' + escapeHtml(item.line) + '</p>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function render() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var found = window.SEARCH_MOVIES.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line, item.category].join(' ').toLowerCase();
        var matchQuery = !q || text.indexOf(q) !== -1;
        var matchType = !t || item.type === t;
        var matchYear = !y || item.year === y;
        return matchQuery && matchType && matchYear;
      }).slice(0, 120);
      results.innerHTML = found.map(card).join('');
      if (note) {
        note.textContent = found.length ? '已显示匹配结果，点击卡片可进入对应详情页。' : '没有找到匹配内容，请更换关键词或筛选条件。';
      }
    }

    form.addEventListener('input', render);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    render();
  });
})();

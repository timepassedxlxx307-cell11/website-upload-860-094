(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        if (slides.length > 1) {
            restart();
        }
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    function setupFilters() {
        var panel = document.querySelector('.filter-panel');
        var list = document.querySelector('[data-movie-list]');
        if (!panel || !list) {
            return;
        }
        var query = panel.querySelector('[data-filter-query]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var category = panel.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (query && initial) {
            query.value = initial;
        }

        function valueOf(el) {
            return el ? el.value.trim().toLowerCase() : '';
        }

        function apply() {
            var q = valueOf(query);
            var y = valueOf(year);
            var r = valueOf(region);
            var t = valueOf(type);
            var c = valueOf(category);
            var visible = 0;
            cards.forEach(function (card) {
                var ok = true;
                if (q && textOf(card).indexOf(q) === -1) {
                    ok = false;
                }
                if (y && (card.getAttribute('data-year') || '').toLowerCase() !== y) {
                    ok = false;
                }
                if (r && (card.getAttribute('data-region') || '').toLowerCase() !== r) {
                    ok = false;
                }
                if (t && (card.getAttribute('data-type') || '').toLowerCase() !== t) {
                    ok = false;
                }
                if (c && (card.getAttribute('data-category') || '').toLowerCase() !== c) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [query, year, region, type, category].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener('input', apply);
            el.addEventListener('change', apply);
        });
        apply();
    }

    function setupPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.player-cover');
            if (!video || !cover) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var hls;

            function attach() {
                if (video.getAttribute('data-ready') === 'true') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.setAttribute('data-ready', 'true');
            }

            function play() {
                attach();
                cover.classList.add('is-hidden');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            cover.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function setupHeroSearch() {
        var form = document.querySelector('[data-hero-search]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                return;
            }
            event.preventDefault();
            window.location.href = './search.html';
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
        setupHeroSearch();
    });
})();

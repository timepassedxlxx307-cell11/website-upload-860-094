(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            button.classList.toggle("is-open");
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilters() {
        var grid = document.querySelector("[data-card-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var input = document.querySelector("[data-filter-input]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var reset = document.querySelector("[data-filter-reset]");
        var empty = document.querySelector("[data-empty-state]");

        function apply() {
            var q = text(input && input.value);
            var t = type && type.value;
            var y = year && year.value;
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = text(card.dataset.title + " " + card.dataset.tags + " " + card.dataset.region + " " + card.dataset.type);
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && text(card.dataset.type).indexOf(text(t)) === -1) {
                    ok = false;
                }
                if (y && card.dataset.year !== y) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }
        apply();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
        }).join("");
        return '<article class="movie-card group">' +
            '<a href="' + escapeHtml(movie.file) + '" class="block h-full">' +
            '<div class="card-shell bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">' +
            '<div class="relative overflow-hidden aspect-[4/3]">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">' +
            '<div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90"></div>' +
            '<div class="absolute left-3 top-3 rounded-full bg-primary-500 text-white text-xs font-semibold px-3 py-1">' + escapeHtml(movie.categoryName) + '</div>' +
            '<div class="absolute right-3 top-3 rounded-full bg-black/55 text-white text-xs px-2 py-1">' + escapeHtml(movie.year) + '</div>' +
            '</div>' +
            '<div class="p-4 flex-1 flex flex-col">' +
            '<h3 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">' + escapeHtml(movie.title) + '</h3>' +
            '<p class="mt-2 text-sm text-gray-600 line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="mt-4 flex flex-wrap gap-2">' + tags + '</div>' +
            '</div></div></a></article>';
    }

    function initSearch() {
        var results = document.querySelector("[data-search-results]");
        if (!results || !window.MOVIES) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var reset = document.querySelector("[data-filter-reset]");
        var status = document.querySelector("[data-search-status]");
        var empty = document.querySelector("[data-search-empty]");

        function apply() {
            var q = text(input && input.value);
            var t = text(type && type.value);
            var y = year && year.value;
            var list = window.MOVIES.filter(function (movie) {
                var haystack = text(movie.title + " " + movie.oneLine + " " + movie.region + " " + movie.type + " " + movie.genre + " " + (movie.tags || []).join(" "));
                if (q && haystack.indexOf(q) === -1) {
                    return false;
                }
                if (t && text(movie.type).indexOf(t) === -1) {
                    return false;
                }
                if (y && String(movie.year) !== y) {
                    return false;
                }
                return true;
            }).slice(0, 96);
            results.innerHTML = list.map(movieCard).join("");
            if (status) {
                status.textContent = q || t || y ? "搜索结果" : "热门推荐";
            }
            if (empty) {
                empty.classList.toggle("is-visible", list.length === 0);
            }
        }

        [input, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }
        apply();
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var button = player.querySelector("[data-play-button]");
        var stream = player.getAttribute("data-stream");
        var hls = null;
        var loaded = false;

        function load() {
            if (loaded || !video || !stream) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initCardFilters();
        initSearch();
        initPlayer();
    });
})();

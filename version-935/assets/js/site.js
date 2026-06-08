(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector(".player-button");
            var hls = null;
            var initialized = false;
            if (!video || !button) {
                return;
            }

            function bind() {
                if (initialized) {
                    return;
                }
                var src = video.getAttribute("data-src");
                if (!src) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                initialized = true;
            }

            function play() {
                bind();
                button.classList.add("is-hidden");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!initialized) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function setupGridFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var grid = scope.parentElement.querySelector("[data-card-grid]");
            var search = scope.querySelector("[data-grid-search]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var state = {
                type: "",
                year: "",
                keyword: ""
            };
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

            function apply() {
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var typeMatch = !state.type || (card.getAttribute("data-type") || "").indexOf(state.type) !== -1;
                    var yearMatch = !state.year || (card.getAttribute("data-year") || "") === state.year;
                    var keywordMatch = !state.keyword || text.indexOf(state.keyword) !== -1;
                    card.classList.toggle("is-hidden", !(typeMatch && yearMatch && keywordMatch));
                });
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.getAttribute("data-filter-key");
                    var value = button.getAttribute("data-filter-value") || "";
                    state[key] = value;
                    buttons.filter(function (item) {
                        return item.getAttribute("data-filter-key") === key;
                    }).forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            if (search) {
                search.addEventListener("input", function () {
                    state.keyword = search.value.trim().toLowerCase();
                    apply();
                });
            }
        });
    }

    function movieResultCard(movie) {
        return [
            "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">",
            "<figure class=\"movie-poster\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<figcaption>" + escapeHtml(movie.type) + "</figcaption>",
            "</figure>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"movie-tags\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "</div>",
            "</a>"
        ].join("");
    }

    function setupSearch() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-site-search]");
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var subtitle = document.querySelector("[data-search-subtitle]");
        if (!form || !input || !results || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("q") || "";
        if (initialKeyword) {
            input.value = initialKeyword;
            render(initialKeyword);
        }

        function render(keyword) {
            var normalized = keyword.trim().toLowerCase();
            if (!normalized) {
                if (title) {
                    title.textContent = "精选内容";
                }
                if (subtitle) {
                    subtitle.textContent = "可以直接浏览，也可以使用上方搜索框精确查找。";
                }
                results.innerHTML = window.SITE_MOVIES.slice(0, 24).map(movieResultCard).join("");
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                return String(movie.text || "").toLowerCase().indexOf(normalized) !== -1;
            }).slice(0, 120);
            if (title) {
                title.textContent = "搜索结果";
            }
            if (subtitle) {
                subtitle.textContent = matched.length ? "已匹配到相关影片" : "未找到相关影片";
            }
            results.innerHTML = matched.length ? matched.map(movieResultCard).join("") : "<div class=\"content-card\"><h2>未找到相关影片</h2><p>可以更换片名、地区、年份、类型或标签继续搜索。</p></div>";
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render(input.value);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupPlayers();
        setupGridFilters();
        setupSearch();
    });
})();

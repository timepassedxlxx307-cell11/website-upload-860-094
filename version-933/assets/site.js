(function() {
    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            const open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, itemIndex) {
            slide.classList.toggle("is-active", itemIndex === current);
        });
        dots.forEach(function(dot, itemIndex) {
            dot.classList.toggle("is-active", itemIndex === current);
        });
    }

    function restartTimer() {
        if (!slides.length) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
                restartTimer();
            });
        }

        restartTimer();
    }

    const localSearch = document.querySelector(".local-search");
    const searchInput = document.getElementById("movieSearch") || localSearch;
    const clearSearch = document.querySelector(".clear-search");
    const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
    const cards = Array.from(document.querySelectorAll(".searchable-list .movie-card, .searchable-list .rank-item"));
    let currentFilter = "";

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(searchInput ? searchInput.value : "");
        cards.forEach(function(card) {
            const haystack = normalize(card.getAttribute("data-search"));
            const type = normalize(card.getAttribute("data-type"));
            const category = normalize(card.getAttribute("data-category"));
            const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            const filterMatch = !currentFilter || type === currentFilter || category === currentFilter || haystack.indexOf(currentFilter) !== -1;
            card.classList.toggle("hidden-card", !(keywordMatch && filterMatch));
        });
    }

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener("input", applyFilters);
        applyFilters();
    }

    if (clearSearch && searchInput) {
        clearSearch.addEventListener("click", function() {
            searchInput.value = "";
            applyFilters();
            searchInput.focus();
        });
    }

    filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            filterButtons.forEach(function(item) {
                item.classList.remove("is-active");
            });
            button.classList.add("is-active");
            currentFilter = normalize(button.getAttribute("data-filter"));
            applyFilters();
        });
    });
}());

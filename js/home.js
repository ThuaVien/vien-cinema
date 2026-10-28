
/* =========================================
   TV - DỮ LIỆU PHIM TỪ TMDB
   File: js/home.js
   ========================================= */

(() => {
    "use strict";

    const API_KEY = "a99343d7865f86fcae89ad4bd468a516";
    const API_URL = "https://api.themoviedb.org/3";
    const IMAGE_URL = "https://image.tmdb.org/t/p/";
    const LANGUAGE = "vi-VN";

    const $ = (selector) => document.querySelector(selector);

    // =========================================
    // GỌI API TMDB
    // =========================================
    async function getTMDB(endpoint, params = {}) {
        const url = new URL(`${API_URL}${endpoint}`);

        url.searchParams.set("api_key", API_KEY);
        url.searchParams.set("language", LANGUAGE);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Lỗi TMDB: ${response.status}`);
        }

        return response.json();
    }

    function getYear(date) {
        return date ? date.slice(0, 4) : "Chưa rõ";
    }

    function getImage(path, size = "w500") {
        return path ? `${IMAGE_URL}${size}${path}` : "";
    }

    function getRating(rating) {
        const number = Number(rating);
        return number > 0 ? number.toFixed(1) : "Chưa có";
    }

    function showStatus(message, isError = false) {
        const status = $("#tv-api-status");
        if (!status) return;

        status.textContent = message;
        status.classList.toggle("is-error", isError);
    }

    // =========================================
    // LƯU LỊCH SỬ XEM THEO TÀI KHOẢN
    // =========================================
    function saveMovieToHistory(movie) {
        let currentUser;

        try {
            currentUser = JSON.parse(
                localStorage.getItem("tv_current_user") || "null"
            );
        } catch (error) {
            currentUser = null;
        }

        // Chưa đăng nhập thì không lưu lịch sử
        if (!currentUser || !currentUser.id) {
            return;
        }

        const storageKey = `tv_watch_history_${currentUser.id}`;
        let history = [];

        try {
            history = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );

            if (!Array.isArray(history)) {
                history = [];
            }
        } catch (error) {
            history = [];
        }

        const movieRecord = {
            id: String(movie.id),
            title: movie.title || movie.original_title || "Chưa có tên",
            posterPath: movie.poster_path || "",
            releaseDate: movie.release_date || "",
            rating: Number(movie.vote_average) || 0,
            viewedAt: new Date().toISOString()
        };

        // Bỏ bản ghi cũ của phim này để không bị trùng
        history = history.filter(
            item => String(item.id) !== String(movie.id)
        );

        // Đưa phim vừa chọn lên đầu lịch sử
        history.unshift(movieRecord);

        // Chỉ giữ tối đa 50 phim gần đây
        history = history.slice(0, 50);

        try {
            localStorage.setItem(storageKey, JSON.stringify(history));
        } catch (error) {
            console.error("Không thể lưu lịch sử xem:", error);
        }
    }

    // Lưu phim rồi mở trang chi tiết
    function openMovie(movie) {
        if (!movie || !movie.id) return;

        saveMovieToHistory(movie);

        window.location.href =
            `movie-detail.html?id=${encodeURIComponent(movie.id)}`;
    }

    // =========================================
    // TẠO THẺ PHIM
    // =========================================
    function createMovieCard(movie, index = 0, isNew = false) {
        const card = document.createElement("article");
        card.addEventListener("click", () => {
            saveClickedMovie(movie);
        });
        card.className = "tv-movie-card";
        card.dataset.movieId = movie.id;
        card.style.cursor = "pointer";
        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");
        card.setAttribute(
            "aria-label",
            `Xem phim ${movie.title || movie.original_title || ""}`
        );

        const poster = document.createElement("div");
        poster.className = "tv-movie-poster";
        poster.style.position = "relative";
        poster.style.overflow = "hidden";

        const imagePath = getImage(movie.poster_path);

        if (imagePath) {
            const image = document.createElement("img");
            image.src = imagePath;
            image.alt = `Poster ${movie.title || "phim"}`;
            image.loading = "lazy";
            image.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                position: absolute;
                inset: 0;
            `;

            image.onerror = () => image.remove();
            poster.appendChild(image);
        } else {
            const label = document.createElement("span");
            label.className = "tv-movie-poster-label";
            label.textContent = "TV";
            poster.appendChild(label);
        }

        if (isNew && index < 3) {
            const badge = document.createElement("span");
            badge.className = "tv-movie-badge";
            badge.textContent = "MỚI";
            badge.style.position = "relative";
            poster.appendChild(badge);
        }

        const info = document.createElement("div");
        info.className = "tv-movie-info";

        const title = document.createElement("h3");
        title.className = "tv-movie-title";
        title.textContent =
            movie.title || movie.original_title || "Chưa có tên";

        const meta = document.createElement("div");
        meta.className = "tv-movie-meta";

        const year = document.createElement("span");
        year.textContent = getYear(movie.release_date);

        const rating = document.createElement("span");
        rating.className = "tv-rating";
        rating.textContent = `★ ${getRating(movie.vote_average)}`;

        meta.append(year, rating);
        info.append(title, meta);
        card.append(poster, info);

        // Bấm thẻ phim để lưu lịch sử và mở chi tiết
        card.addEventListener("click", () => openMovie(movie));

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMovie(movie);
            }
        });

        return card;
    }

    // =========================================
    // HIỂN THỊ DANH SÁCH PHIM
    // =========================================
    function renderMovies(selector, movies, isNew = false) {
        const container = $(selector);
        if (!container) return;

        container.replaceChildren();

        if (!movies || movies.length === 0) {
            const message = document.createElement("p");
            message.className = "tv-api-empty";
            message.textContent = "Chưa có dữ liệu phim.";
            container.appendChild(message);
            return;
        }

        movies.forEach((movie, index) => {
            container.appendChild(createMovieCard(movie, index, isNew));
        });
    }

    // =========================================
    // PHIM NỔI BẬT
    // =========================================
    async function loadFeaturedMovie() {
        const data = await getTMDB("/movie/popular", { page: 1 });
        const movie = data.results?.[0];

        if (!movie) {
            throw new Error("Không tìm thấy phim nổi bật.");
        }

        const title = $("#tv-featured-title");
        const description = $("#tv-featured-description");
        const hero = $("#tv-home-hero");

        if (title) {
            title.textContent =
                movie.title || movie.original_title || "Phim nổi bật";
        }

        if (description) {
            description.textContent =
                movie.overview || "Chưa có mô tả cho bộ phim này.";
        }

        const rating = $("#tv-featured-meta-1");
        const year = $("#tv-featured-meta-2");
        const type = $("#tv-featured-meta-3");
        const genre = $("#tv-featured-meta-4");

        if (rating) rating.textContent = `★ ${getRating(movie.vote_average)}`;
        if (year) year.textContent = getYear(movie.release_date);
        if (type) type.textContent = "Phim điện ảnh";
        if (genre) genre.textContent = "Phim nổi bật";

        if (hero && movie.backdrop_path) {
            const backdrop = getImage(movie.backdrop_path, "original");

            hero.style.backgroundImage =
                `linear-gradient(90deg, rgba(13,15,18,.96), rgba(13,15,18,.35)), url("${backdrop}")`;

            hero.style.backgroundSize = "cover";
            hero.style.backgroundPosition = "center";
        }

        // Nút xem thông tin: lưu lịch sử rồi mở trang chi tiết
        const detailLink = $(".tv-home-info-btn");

        if (detailLink) {
            detailLink.href =
                `movie-detail.html?id=${encodeURIComponent(movie.id)}`;

            detailLink.addEventListener("click", () => {
                saveMovieToHistory(movie);
            });
        }

        // Nút xem phim: cũng ghi nhận lịch sử trước khi chuyển trang
        const watchLink = $(".tv-home-watch-btn");

        if (watchLink) {
            watchLink.href =
                `watch.html?id=${encodeURIComponent(movie.id)}`;

            watchLink.addEventListener("click", () => {
                saveMovieToHistory(movie);
            });
        }
    }

    // =========================================
    // PHIM ĐANG CHIẾU TẠI VIỆT NAM
    // =========================================
    async function loadNewMovies() {
        const data = await getTMDB("/movie/now_playing", {
            page: 1,
            region: "VN"
        });

        renderMovies("#tv-new-movies", data.results || [], true);
    }

    // =========================================
    // PHIM PHỔ BIẾN
    // =========================================
    async function loadPopularMovies() {
        const data = await getTMDB("/movie/popular", { page: 1 });

        renderMovies(
            "#tv-popular-movies",
            (data.results || []).slice(0, 10)
        );
    }

    // =========================================
    // THỂ LOẠI PHIM
    // =========================================
    async function loadGenres() {
        const data = await getTMDB("/genre/movie/list");
        const container = $("#tv-home-categories");

        if (!container) return;

        container.replaceChildren();

        (data.genres || []).slice(0, 8).forEach((genre) => {
            const link = document.createElement("a");

            link.href =
                `movies.html?genre=${encodeURIComponent(genre.id)}`;

            link.className = "tv-home-category-card";

            const content = document.createElement("div");
            content.className = "tv-home-category-content";

            const title = document.createElement("h3");
            title.className = "tv-home-category-title";
            title.textContent = genre.name;

            const description = document.createElement("p");
            description.className = "tv-home-category-count";
            description.textContent = "Khám phá phim";

            content.append(title, description);
            link.appendChild(content);
            container.appendChild(link);
        });
    }

    // =========================================
    // KHỞI CHẠY
    // =========================================
    async function init() {
        showStatus("Đang tải dữ liệu phim từ TMDB...");

        const tasks = await Promise.allSettled([
            loadFeaturedMovie(),
            loadNewMovies(),
            loadPopularMovies(),
            loadGenres()
        ]);

        const failed = tasks.filter(task => task.status === "rejected");

        if (failed.length === tasks.length) {
            showStatus(
                "Không thể tải dữ liệu. Hãy kiểm tra API key và kết nối Internet.",
                true
            );

            console.error(
                "Lỗi TMDB:",
                failed.map(task => task.reason)
            );
            return;
        }

        if (failed.length > 0) {
            showStatus(
                "Một số mục chưa tải được. Vui lòng kiểm tra kết nối.",
                true
            );

            console.error(
                "Một số yêu cầu TMDB thất bại:",
                failed.map(task => task.reason)
            );
            return;
        }

        showStatus("Dữ liệu phim đã được cập nhật.");

        window.setTimeout(() => {
            const status = $("#tv-api-status");
            if (status) status.textContent = "";
        }, 3000);
    }

    document.addEventListener("DOMContentLoaded", init);
})();
// Lưu phim được nhấp vào sessionStorage
function saveClickedMovie(movie) {
    const historyKey = "tv_watch_history";

    let history = [];

    try {
        history = JSON.parse(
            sessionStorage.getItem(historyKey)
        ) || [];
    } catch (error) {
        history = [];
    }

    // Nếu phim đã tồn tại thì xóa bản ghi cũ
    history = history.filter(
        item => String(item.id) !== String(movie.id)
    );

    // Đưa phim vừa nhấp lên đầu danh sách
    history.unshift({
        id: movie.id,
        title: movie.title || movie.name || "Chưa có tên",
        posterPath: movie.poster_path || "",
        viewedAt: new Date().toISOString()
    });

    sessionStorage.setItem(
        historyKey,
        JSON.stringify(history)
    );
}


document.addEventListener("DOMContentLoaded", () => {
    fetchAndRenderCategories();
});

// TMDB API Key của bạn
const TMDB_API_KEY = "a99343d7865f86fcae89ad4bd468a516"; 

// Bảng ánh xạ icon chữ cái dựa theo ID thể loại chuẩn của TMDB
const GENRE_ICON_MAP = {
    28: "A",     // Action (Hành động)
    12: "P",     // Adventure (Phiêu lưu)
    16: "HH",    // Animation (Hoạt hình)
    35: "H",     // Comedy (Hài)
    80: "TT",    // Crime (Tội phạm / Trinh thám)
    99: "TL",    // Documentary (Tài liệu)
    18: "CT",    // Drama (Chính kịch)
    10751: "GD", // Family (Gia đình)
    14: "GT",    // Fantasy (Giả tưởng)
    36: "LS",    // History (Lịch sử)
    27: "K",     // Horror (Kinh dị)
    10402: "AN", // Music (Âm nhạc)
    9648: "B3",  // Mystery (Bí ẩn)
    10749: "T",  // Romance (Tình cảm)
    878: "KH",   // Science Fiction (Khoa học viễn tưởng)
    10770: "TV", // TV Movie
    53: "TL",    // Thriller (Giật gân / Tâm lý)
    10752: "CT", // War (Chiến tranh)
    37: "P"      // Western (Miền tây)
};

async function fetchAndRenderCategories() {
    const gridContainer = document.getElementById("categories-grid");
    const messageContainer = document.getElementById("categories-message");

    if (!gridContainer) return;

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=vi-VN`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.genres && data.genres.length > 0) {
            gridContainer.innerHTML = ""; // Xóa loading spinner

            data.genres.forEach(genre => {
                const icon = GENRE_ICON_MAP[genre.id] || genre.name.charAt(0).toUpperCase();

                const cardHTML = `
                    <a href="movies.html?genre=${genre.id}" class="tv-category-card">
                        <div class="tv-category-content">
                            <div class="tv-category-icon">${icon}</div>
                            <h2 class="tv-category-title">${genre.name}</h2>
                            <p class="tv-category-count">Xem phim →</p>
                        </div>
                    </a>
                `;
                gridContainer.insertAdjacentHTML("beforeend", cardHTML);
            });
        } else {
            gridContainer.innerHTML = "<p class='text-light'>Không tìm thấy thể loại phim nào.</p>";
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách thể loại từ TMDB:", error);
        gridContainer.innerHTML = "";
        if (messageContainer) {
            messageContainer.innerHTML = "<p class='text-danger'>Không thể tải danh sách thể loại. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.</p>";
        }
    }
}
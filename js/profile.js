
/* =========================================
   TV - HỒ SƠ NGƯỜI DÙNG
   File: js/profile.js
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    // =========================================
    // HÀM ĐỌC TÀI KHOẢN ĐANG ĐĂNG NHẬP
    // =========================================
    function getCurrentUser() {
        try {
            return JSON.parse(
                localStorage.getItem("tv_current_user") || "null"
            );
        } catch (error) {
            return null;
        }
    }

    // =========================================
    // CẬP NHẬT THÔNG TIN HIỂN THỊ
    // =========================================
    function updateDisplayedUser(name, email) {
        document.querySelectorAll("[data-tv-user-name]").forEach(element => {
            element.textContent = name;
        });

        document.querySelectorAll("[data-tv-user-email]").forEach(element => {
            element.textContent = email;
        });

        document.querySelectorAll("[data-tv-user-initial]").forEach(element => {
            element.textContent =
                name.trim().charAt(0).toUpperCase() || "V";
        });
    }

    // =========================================
    // CHỈNH SỬA HỒ SƠ
    // =========================================
    const editButton = document.getElementById("profile-edit-btn");
    const cancelButton = document.getElementById("profile-cancel-btn");
    const form = document.getElementById("profile-form");
    const actions = document.getElementById("profile-form-actions");
    const message = document.getElementById("profile-message");

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");

    if (
        editButton &&
        cancelButton &&
        form &&
        actions &&
        nameInput &&
        emailInput
    ) {
        let originalName = nameInput.value;
        let originalEmail = emailInput.value;

        function setEditing(isEditing) {
            nameInput.disabled = !isEditing;
            emailInput.disabled = !isEditing;

            actions.hidden = !isEditing;
            editButton.hidden = isEditing;

            if (isEditing) {
                nameInput.focus();
            }
        }

        editButton.addEventListener("click", function () {
            originalName = nameInput.value;
            originalEmail = emailInput.value;

            if (message) message.textContent = "";

            setEditing(true);
        });

        cancelButton.addEventListener("click", function () {
            nameInput.value = originalName;
            emailInput.value = originalEmail;

            if (message) message.textContent = "";

            setEditing(false);
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();

            if (!name || !email) {
                if (message) {
                    message.textContent =
                        "Vui lòng nhập đầy đủ họ tên và email.";
                }
                return;
            }

            if (!emailInput.checkValidity()) {
                if (message) {
                    message.textContent =
                        "Vui lòng nhập địa chỉ email hợp lệ.";
                }

                emailInput.focus();
                return;
            }

            const user = getCurrentUser();

            if (user) {
                // Kiểm tra email có thuộc tài khoản khác không
                let users = [];

                try {
                    users = JSON.parse(
                        localStorage.getItem("tv_users") || "[]"
                    );

                    if (!Array.isArray(users)) {
                        users = [];
                    }
                } catch (error) {
                    users = [];
                }

                const emailExists = users.some(item =>
                    item.id !== user.id &&
                    String(item.email).toLowerCase() === email.toLowerCase()
                );

                if (emailExists) {
                    if (message) {
                        message.textContent =
                            "Email này đã được sử dụng bởi tài khoản khác.";
                    }
                    return;
                }

                user.name = name;
                user.email = email;

                // Cập nhật tài khoản hiện tại
                localStorage.setItem(
                    "tv_current_user",
                    JSON.stringify(user)
                );

                // Cập nhật danh sách tài khoản đã đăng ký
                const userIndex = users.findIndex(
                    item => item.id === user.id
                );

                if (userIndex !== -1) {
                    users[userIndex].name = name;
                    users[userIndex].email = email;

                    localStorage.setItem(
                        "tv_users",
                        JSON.stringify(users)
                    );
                }
            }

            updateDisplayedUser(name, email);

            originalName = name;
            originalEmail = email;

            if (message) {
                message.textContent = "Thông tin đã được cập nhật.";
            }

            setEditing(false);
        });
    }

    // =========================================
    // LỊCH SỬ XEM PHIM
    // =========================================
   
function renderWatchHistory() {
    const movieGrid = document.getElementById("tv-watch-history");

    if (!movieGrid) return;

    movieGrid.innerHTML = "";

    let history = [];

    try {
        history = JSON.parse(
            sessionStorage.getItem("tv_watch_history")
        ) || [];
    } catch (error) {
        history = [];
    }

    if (!history.length) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "tv-api-empty";
        emptyMessage.textContent = "Bạn chưa xem bộ phim nào.";
        movieGrid.appendChild(emptyMessage);
        return;
    }

    history.forEach(movie => {
        const card = document.createElement("a");
        card.className = "tv-profile-movie-card";
        card.href = `movie-detail.html?id=${encodeURIComponent(movie.id)}`;

        const poster = document.createElement("div");
        poster.className = "tv-profile-movie-poster";

        if (movie.posterPath) {
            const image = document.createElement("img");
            image.src = `https://image.tmdb.org/t/p/w500${movie.posterPath}`;
            image.alt = movie.title || "Poster phim";
            image.loading = "lazy";

            image.onerror = () => {
                image.remove();
                poster.textContent = movie.title || "Không có poster";
            };

            poster.appendChild(image);
        } else {
            poster.textContent = movie.title || "Không có poster";
        }

        const info = document.createElement("div");
        info.className = "tv-profile-movie-info";

        const title = document.createElement("h3");
        title.textContent = movie.title || "Chưa có tên phim";

        info.appendChild(title);
        card.append(poster, info);
        movieGrid.appendChild(card);
    });
}

// Hiển thị lịch sử khi trang tài khoản được tải
document.addEventListener("DOMContentLoaded", renderWatchHistory);


    // =========================================
    // THÔNG BÁO KHI CHƯA CÓ LỊCH SỬ
    // =========================================
    function showEmptyHistory(container, text) {
        const message = document.createElement("p");
        message.className = "tv-api-empty";
        message.textContent = text;

        container.appendChild(message);
    }

    renderWatchHistory();
});

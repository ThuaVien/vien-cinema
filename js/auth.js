
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================
       TV - AUTH SYSTEM
       Dùng chung cho login, register, profile
       ========================================= */

    const USERS_KEY = "tv_users";
    const CURRENT_USER_KEY = "tv_current_user";
    
function updateHeaderAuth() {
    const currentUser = JSON.parse(
        localStorage.getItem("tv_current_user") || "null"
    );

    const isLoggedIn = Boolean(currentUser);

    // Các nút đăng nhập và đăng ký trên header
    document.querySelectorAll(
        ".tv-header .tv-login-btn, " +
        ".tv-header .tv-register-btn, " +
        ".tv-header a[href='login.html'], " +
        ".tv-header a[href='register.html']"
    ).forEach(button => {
        // Khi đăng nhập: ẩn cả hai nút
        button.hidden = isLoggedIn;
    });

    // Ẩn nút đăng xuất nếu có trong header
    document.querySelectorAll(
        ".tv-header .tv-logout-btn, " +
        ".tv-header a[href='logout.html']"
    ).forEach(button => {
        button.hidden = true;
    });
}

document.addEventListener("DOMContentLoaded", updateHeaderAuth);

    const PENDING_EMAIL_KEY = "tv_pending_email";

    /* =========================================
       ELEMENTS
       Hỗ trợ ID đang dùng trên website TV
       ========================================= */

    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");

    const loginPasswordToggle =
        document.getElementById("togglePassword") ||
        document.getElementById("login-password-toggle");

    const registerForm = document.getElementById("registerForm");
    const registerName = document.getElementById("register-name");
    const registerEmail = document.getElementById("register-email");
    const registerPassword = document.getElementById("register-password");

    const registerConfirmPassword = document.getElementById(
        "register-confirm-password"
    );

    const registerPasswordToggle =
        document.getElementById("registerPasswordToggle") ||
        document.getElementById("register-password-toggle");

    const registerConfirmPasswordToggle =
        document.getElementById("registerConfirmPasswordToggle");

    /* =========================================
       STORAGE
       ========================================= */

    function getUsers() {
        try {
            const savedUsers = localStorage.getItem(USERS_KEY);
            const users = savedUsers ? JSON.parse(savedUsers) : [];

            return Array.isArray(users) ? users : [];
        } catch (error) {
            console.error("Không thể đọc danh sách tài khoản:", error);
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error("Không thể lưu tài khoản:", error);
            return false;
        }
    }

    function getCurrentUser() {
        try {
            const savedUser = localStorage.getItem(CURRENT_USER_KEY);
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Dữ liệu đăng nhập không hợp lệ:", error);
            return null;
        }
    }

    function saveCurrentUser(user) {
        // Không đưa mật khẩu vào thông tin phiên đăng nhập.
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        try {
            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(currentUser)
            );

            return true;
        } catch (error) {
            console.error("Không thể lưu phiên đăng nhập:", error);
            return false;
        }
    }

    function logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = "index.html";
    }

    /* =========================================
       VALIDATION HELPERS
       ========================================= */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getErrorElement(input) {
        if (!input) return null;

        const errorId = input.id + "-error";
        return document.getElementById(errorId);
    }

    function setError(input, message) {
        if (!input) return;

        input.classList.add("input-error");
        input.classList.remove("input-success");
        input.setAttribute("aria-invalid", "true");

        const errorElement = getErrorElement(input);

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearError(input) {
        if (!input) return;

        input.classList.remove("input-error", "input-success");
        input.removeAttribute("aria-invalid");

        const errorElement = getErrorElement(input);

        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    function setValid(input) {
        if (!input) return;

        input.classList.remove("input-error");
        input.classList.add("input-success");
        input.setAttribute("aria-invalid", "false");

        const errorElement = getErrorElement(input);

        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    function showFormMessage(form, message, type) {
        if (!form) return;

        const formId = form.id === "loginForm"
            ? "login-success"
            : "register-success";

        let messageElement = document.getElementById(formId);

        if (!messageElement) {
            messageElement = document.createElement("div");
            messageElement.id = formId;
            messageElement.className =
                form.id === "loginForm"
                    ? "tv-login-success"
                    : "tv-register-success";

            messageElement.setAttribute("role", "status");
            messageElement.setAttribute("aria-live", "polite");

            form.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.classList.toggle("is-error", type === "error");
        messageElement.classList.toggle("is-success", type === "success");
    }

    function clearFormMessage(form) {
        if (!form) return;

        const messageId = form.id === "loginForm"
            ? "login-success"
            : "register-success";

        const messageElement = document.getElementById(messageId);

        if (messageElement) {
            messageElement.textContent = "";
            messageElement.classList.remove("is-error", "is-success");
        }
    }

    /* =========================================
       PASSWORD VISIBILITY
       ========================================= */

    function setupPasswordToggle(input, button) {
        if (!input || !button) return;

        button.addEventListener("click", function () {
            const isHidden = input.type === "password";

            input.type = isHidden ? "text" : "password";

            // Hỗ trợ nút chữ "Hiện" / "Ẩn" hiện tại.
            if (button.querySelector("i")) {
                const icon = button.querySelector("i");

                icon.classList.toggle("bi-eye", !isHidden);
                icon.classList.toggle("bi-eye-slash", isHidden);
            } else {
                button.textContent = isHidden ? "Ẩn" : "Hiện";
            }

            button.setAttribute(
                "aria-label",
                isHidden ? "Ẩn mật khẩu" : "Hiện mật khẩu"
            );
        });
    }

    setupPasswordToggle(loginPassword, loginPasswordToggle);
    setupPasswordToggle(registerPassword, registerPasswordToggle);
    setupPasswordToggle(
        registerConfirmPassword,
        registerConfirmPasswordToggle
    );

    /* =========================================
       LOGIN VALIDATION
       ========================================= */

    function validateLoginEmail() {
        if (!loginEmail) return true;

        const email = loginEmail.value.trim();

        if (!email) {
            setError(loginEmail, "Vui lòng nhập email.");
            return false;
        }

        if (!isValidEmail(email)) {
            setError(loginEmail, "Email không đúng định dạng.");
            return false;
        }

        setValid(loginEmail);
        return true;
    }

    function validateLoginPassword() {
        if (!loginPassword) return true;

        const password = loginPassword.value;

        if (!password) {
            setError(loginPassword, "Vui lòng nhập mật khẩu.");
            return false;
        }

        if (password.length < 6) {
            setError(
                loginPassword,
                "Mật khẩu phải có ít nhất 6 ký tự."
            );
            return false;
        }

        setValid(loginPassword);
        return true;
    }

    /* =========================================
       REGISTER VALIDATION
       ========================================= */

    function validateRegisterName() {
        if (!registerName) return true;

        const name = registerName.value.trim();

        if (!name) {
            setError(registerName, "Vui lòng nhập họ và tên.");
            return false;
        }

        if (name.length < 2) {
            setError(
                registerName,
                "Họ và tên phải có ít nhất 2 ký tự."
            );
            return false;
        }

        setValid(registerName);
        return true;
    }

    function validateRegisterEmail() {
        if (!registerEmail) return true;

        const email = registerEmail.value.trim();

        if (!email) {
            setError(registerEmail, "Vui lòng nhập email.");
            return false;
        }

        if (!isValidEmail(email)) {
            setError(registerEmail, "Email không đúng định dạng.");
            return false;
        }

        setValid(registerEmail);
        return true;
    }

    function validateRegisterPassword() {
        if (!registerPassword) return true;

        const password = registerPassword.value;

        if (!password) {
            setError(registerPassword, "Vui lòng tạo mật khẩu.");
            return false;
        }

        if (password.length < 6) {
            setError(
                registerPassword,
                "Mật khẩu phải có ít nhất 6 ký tự."
            );
            return false;
        }

        setValid(registerPassword);
        return true;
    }

    function validateConfirmPassword() {
        if (!registerConfirmPassword) return true;

        const confirmPassword = registerConfirmPassword.value;

        if (!confirmPassword) {
            setError(
                registerConfirmPassword,
                "Vui lòng xác nhận mật khẩu."
            );
            return false;
        }

        if (
            !registerPassword ||
            confirmPassword !== registerPassword.value
        ) {
            setError(
                registerConfirmPassword,
                "Mật khẩu xác nhận không khớp."
            );
            return false;
        }

        setValid(registerConfirmPassword);
        return true;
    }

    /* =========================================
       INPUT EVENTS
       ========================================= */

    function setupInputValidation(input, validator) {
        if (!input) return;

        input.addEventListener("blur", validator);

        input.addEventListener("input", function () {
            clearFormMessage(
                input.closest("form")
            );

            if (!input.value.trim()) {
                clearError(input);
                return;
            }

            validator();
        });
    }

    setupInputValidation(loginEmail, validateLoginEmail);
    setupInputValidation(loginPassword, validateLoginPassword);

    setupInputValidation(registerName, validateRegisterName);
    setupInputValidation(registerEmail, validateRegisterEmail);
    setupInputValidation(
        registerPassword,
        validateRegisterPassword
    );
    setupInputValidation(
        registerConfirmPassword,
        validateConfirmPassword
    );

    if (registerPassword) {
        registerPassword.addEventListener("input", function () {
            if (
                registerConfirmPassword &&
                registerConfirmPassword.value
            ) {
                validateConfirmPassword();
            }
        });
    }

    /* =========================================
       LOGIN SUBMIT
       ========================================= */

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearFormMessage(loginForm);

            const emailValid = validateLoginEmail();
            const passwordValid = validateLoginPassword();

            if (!emailValid || !passwordValid) return;

            const email = loginEmail.value.trim().toLowerCase();
            const password = loginPassword.value;
            const users = getUsers();

            const user = users.find(function (item) {
                return (
                    typeof item.email === "string" &&
                    item.email.toLowerCase() === email
                );
            });

            if (!user || user.password !== password) {
                showFormMessage(
                    loginForm,
                    "Email hoặc mật khẩu không chính xác.",
                    "error"
                );
                return;
            }

            if (!saveCurrentUser(user)) {
                showFormMessage(
                    loginForm,
                    "Không thể lưu phiên đăng nhập trên trình duyệt.",
                    "error"
                );
                return;
            }

            showFormMessage(
                loginForm,
                "Đăng nhập thành công! Đang chuyển trang...",
                "success"
            );

            window.setTimeout(function () {
                window.location.href = "index.html";
            }, 800);
        });
    }

    /* =========================================
       REGISTER SUBMIT
       ========================================= */

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearFormMessage(registerForm);

            const nameValid = validateRegisterName();
            const emailValid = validateRegisterEmail();
            const passwordValid = validateRegisterPassword();
            const confirmValid = validateConfirmPassword();

            if (
                !nameValid ||
                !emailValid ||
                !passwordValid ||
                !confirmValid
            ) {
                return;
            }

            const name = registerName.value.trim();
            const email = registerEmail.value.trim().toLowerCase();
            const password = registerPassword.value;

            const users = getUsers();

            const existingUser = users.find(function (item) {
                return (
                    typeof item.email === "string" &&
                    item.email.toLowerCase() === email
                );
            });

            if (existingUser) {
                setError(
                    registerEmail,
                    "Email này đã được đăng ký."
                );

                showFormMessage(
                    registerForm,
                    "Email đã tồn tại. Vui lòng sử dụng email khác.",
                    "error"
                );

                return;
            }

            const newUser = {
                id:
                    "user_" +
                    Date.now() +
                    "_" +
                    Math.random().toString(36).slice(2, 9),
                name: name,
                email: email,
                password: password,
                role: "student",
                createdAt: new Date().toISOString()
            };

            users.push(newUser);

            if (!saveUsers(users)) {
                showFormMessage(
                    registerForm,
                    "Không thể lưu tài khoản. Hãy kiểm tra bộ nhớ trình duyệt.",
                    "error"
                );
                return;
            }

            showFormMessage(
                registerForm,
                "Đăng ký thành công! Đang chuyển đến trang đăng nhập...",
                "success"
            );

            try {
                sessionStorage.setItem(PENDING_EMAIL_KEY, email);
            } catch (error) {
                console.warn("Không thể lưu email tạm thời:", error);
            }

            registerForm.reset();

            [
                registerName,
                registerEmail,
                registerPassword,
                registerConfirmPassword
            ].forEach(clearError);

            window.setTimeout(function () {
                window.location.href = "login.html";
            }, 800);
        });
    }

    /* =========================================
       ĐIỀN EMAIL SAU KHI ĐĂNG KÝ
       ========================================= */

    if (loginEmail) {
        try {
            const pendingEmail = sessionStorage.getItem(PENDING_EMAIL_KEY);

            if (pendingEmail) {
                loginEmail.value = pendingEmail;
                sessionStorage.removeItem(PENDING_EMAIL_KEY);
            }
        } catch (error) {
            console.warn("Không thể lấy email tạm thời:", error);
        }
    }

    /* =========================================
       HEADER ACCOUNT DISPLAY
       ========================================= */

    function updateHeaderAccount() {
        const currentUser = getCurrentUser();

        document.querySelectorAll(".tv-auth-buttons").forEach(function (el) {
            el.style.display = currentUser ? "none" : "";
        });

        document.querySelectorAll(".tv-account-menu").forEach(function (el) {
            el.style.display = currentUser ? "flex" : "none";
        });

        if (!currentUser) return;

        const initial = (
            typeof currentUser.name === "string" &&
            currentUser.name.trim()
                ? currentUser.name.trim().charAt(0)
                : "U"
        ).toUpperCase();

        document.querySelectorAll("[data-tv-user-name]").forEach(function (el) {
            el.textContent = currentUser.name || "Người dùng";
        });

        document.querySelectorAll("[data-tv-user-initial]").forEach(function (el) {
            el.textContent = initial;
        });

        document.querySelectorAll("[data-tv-user-email]").forEach(function (el) {
            el.textContent = currentUser.email || "";
        });
    }

    updateHeaderAccount();

    /* =========================================
       LOGOUT
       ========================================= */

    document.querySelectorAll("[data-tv-logout]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            logout();
        });
    });

    console.log("TV Auth System đã khởi tạo.");
});

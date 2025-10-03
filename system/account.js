import { translations } from './language.js';

export function updateAccountUI() {
    const username = localStorage.getItem("accountUsername");
    const info = document.getElementById("accountInfo");
    const btn = document.getElementById("accountButton");
    if (username) {
        info.textContent = `| 👤 ${username}`;
        btn.title = translations[localStorage.getItem("language") || "tr"].accountLoggedIn || "Hesap (Çıkış için tıkla)";
    } else {
        info.textContent = "|";
        btn.title = translations[localStorage.getItem("language") || "tr"].accountLogin || "Hesap (Giriş için tıkla)";
    }
}

export function showAccountModal() {
    const modal = document.getElementById("accountModal");
    const username = localStorage.getItem("accountUsername");
    const errorMsg = document.getElementById("accountError");
    errorMsg.style.display = "none";
    if (username) {
        document.getElementById("accountForm").style.display = "none";
        document.getElementById("accountLoggedIn").style.display = "flex";
        document.getElementById("accountWelcome").textContent = `${translations[localStorage.getItem("language") || "tr"].welcome || "Hoşgeldin"}, ${username}!`;
    } else {
        document.getElementById("accountForm").style.display = "flex";
        document.getElementById("accountLoggedIn").style.display = "none";
        document.getElementById("accountUsername").value = "";
        document.getElementById("accountPassword").value = "";
    }
    modal.style.display = "block";
    modal.classList.add("active");
}

export function closeAccountPanel() {
    const modal = document.getElementById("accountModal");
    modal.style.display = "none";
    modal.classList.remove("active");
}

export function updateAccountModalTheme() {
    const theme = localStorage.getItem("theme") || "dark";
    const inner = document.getElementById("accountModalInner");
    if (!inner) return;
    inner.classList.remove("dark", "light");
    inner.classList.add(theme === "light" ? "light" : "dark");
}

// Event listeners (ana script'te)
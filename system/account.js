import { translations } from './language.js';
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { isInappropriateUsername } from './security.js';

// Firebase init (sadece Google için)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Local users storage
let storedUsers = JSON.parse(localStorage.getItem("users") || "{}");

// Rate Limiting için yapılandırma
const MAX_ATTEMPTS = 20;
const LOCKOUT_DURATION = 300000; // 5 dakika (milisaniye cinsinden)

// Rate Limiting kontrolü
function checkRateLimit() {
    const attempts = JSON.parse(localStorage.getItem("loginAttempts") || "{}");
    const now = Date.now();
    const userIp = "anonymous"; // Gerçek IP alamıyoruz, anonim olarak ele alıyoruz
    if (attempts[userIp] && attempts[userIp].count >= MAX_ATTEMPTS && now - attempts[userIp].lastAttempt < LOCKOUT_DURATION) {
        const remaining = Math.ceil((LOCKOUT_DURATION - (now - attempts[userIp].lastAttempt)) / 1000 / 60);
        return { isLocked: true, message: translations[localStorage.getItem("language") || "tr"].rateLimitError?.replace("{remaining}", remaining) || `Çok fazla deneme. Lütfen ${remaining} dakika bekleyin.` };
    }
    return { isLocked: false };
}

// Başarısız deneme kaydı
function recordFailedAttempt() {
    const attempts = JSON.parse(localStorage.getItem("loginAttempts") || "{}");
    const userIp = "anonymous";
    if (!attempts[userIp]) {
        attempts[userIp] = { count: 0, lastAttempt: Date.now() };
    }
    attempts[userIp].count += 1;
    attempts[userIp].lastAttempt = Date.now();
    localStorage.setItem("loginAttempts", JSON.stringify(attempts));
}

// Rate Limiting sıfırlama
function resetRateLimit() {
    const attempts = JSON.parse(localStorage.getItem("loginAttempts") || "{}");
    const userIp = "anonymous";
    if (attempts[userIp]) {
        attempts[userIp].count = 0;
        attempts[userIp].lastAttempt = Date.now();
        localStorage.setItem("loginAttempts", JSON.stringify(attempts));
    }
}

// Buton güncelle fonksiyonu
function updateProfileButton() {
    const username = localStorage.getItem("accountUsername");
    const btn = document.getElementById("accountButton");
    const theme = localStorage.getItem("theme") || "dark";
    const accountIcon = theme === "light" ? "assets/dark/account.png" : "assets/light/account.png";
    if (username) {
        const profilePic = localStorage.getItem("profilePic");
        if (profilePic) {
            const img = document.createElement('img');
            img.src = profilePic;
            img.alt = "Profil Resmi";
            img.style.borderRadius = '50%';
            img.style.width = '40px';
            img.style.height = '40px';
            btn.innerHTML = '';
            btn.appendChild(img);
        } else {
            const img = document.createElement('img');
            img.src = accountIcon;
            img.alt = "Hesap";
            img.style.borderRadius = '50%';
            img.style.width = '20px';
            img.style.height = '20px';
            btn.innerHTML = '';
            btn.appendChild(img);
        }
    } else {
        const img = document.createElement('img');
        img.src = accountIcon;
        img.alt = "Hesap";
        img.style.borderRadius = '50%';
        img.style.width = '20px';
        img.style.height = '20px';
        btn.innerHTML = '';
        btn.appendChild(img);
    }
}

// Helper: Is current session a local user?
function isLocalUserSession() {
    return !auth.currentUser && !!localStorage.getItem("accountUsername");
}

// Auth state observer (sadece Google için)
onAuthStateChanged(auth, (user) => {
    if (user && user.providerData[0]?.providerId === "google.com") {
        let username = user.displayName || user.email.split('@')[0];
        // Google hesapları için kullanıcı adı filtrelemesi kaldırıldı
        localStorage.setItem("accountUsername", username);
        const originalName = localStorage.getItem("originalUsername");
        if (originalName && username !== originalName) {
            document.getElementById("revertNameBtn").style.display = "block";
        } else {
            document.getElementById("revertNameBtn").style.display = "none";
        }
        const btn = document.getElementById("accountButton");
        if (user.photoURL) {
            const img = document.createElement('img');
            img.src = user.photoURL;
            img.alt = "Profil Resmi";
            img.style.borderRadius = '50%';
            img.style.width = '40px';
            img.style.height = '40px';
            btn.innerHTML = '';
            btn.appendChild(img);
        }
        resetRateLimit(); // Başarılı Google girişinde rate limit sıfırla
    } else if (!user) {
        if (!isLocalUserSession()) {
            localStorage.removeItem("accountUsername");
            localStorage.removeItem("originalUsername");
            localStorage.removeItem("profilePic");
            document.getElementById("revertNameBtn").style.display = "none";
            updateProfileButton();
        }
    }
    updateAccountUI();
});

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
        document.getElementById("editNameInput").value = username;
        const originalName = localStorage.getItem("originalUsername");
        document.getElementById("revertNameBtn").style.display = originalName && username !== originalName ? "block" : "none";
        const user = auth.currentUser;
        let isLocal = true;
        if (user && user.providerData[0]?.providerId === "google.com") {
            isLocal = false;
        }
        document.getElementById("uploadPicBtn").style.display = isLocal ? "block" : "none";
        document.querySelector('.profile-edit input[type="file"]').style.display = isLocal ? "block" : "none";
        document.getElementById("removePicBtn").style.display = (isLocal && localStorage.getItem("profilePic")) ? "block" : "none";
        document.getElementById("savePicBtn").style.display = (isLocal && window.selectedFile) ? "block" : "none";
        document.getElementById("picPreview").style.display = isLocal ? "block" : "none";
        const picLabel = document.querySelector('label[for="profilePicInput"].section-label');
        if (picLabel) {
            picLabel.style.display = isLocal ? "block" : "none";
        }
        document.getElementById("uploadPicBtn").disabled = !isLocal;
        document.querySelector('.profile-edit input[type="file"]').disabled = !isLocal;
        document.getElementById("removePicBtn").disabled = !isLocal;
        document.getElementById("savePicBtn").disabled = !isLocal;
        if (!isLocal) {
            document.getElementById("picPreview").innerHTML = "";
        }
    } else {
        document.getElementById("accountForm").style.display = "flex";
        document.getElementById("accountLoggedIn").style.display = "none";
        document.getElementById("accountUsername").value = "";
        document.getElementById("accountPassword").value = "";
        const picLabel = document.querySelector('label[for="profilePicInput"].section-label');
        if (picLabel) {
            picLabel.style.display = "none";
        }
    }
    modal.style.display = "block";
    modal.classList.add("active");
}

export function closeAccountPanel() {
    const modal = document.getElementById("accountModal");
    modal.style.display = "none";
    modal.classList.remove("active");
    const input = document.getElementById("profilePicInput");
    if (input) {
        input.value = "";
        input.style.display = "none";
    }
}

export function updateAccountModalTheme() {
    const theme = localStorage.getItem("theme") || "dark";
    const inner = document.getElementById("accountModalInner");
    if (!inner) return;
    inner.classList.remove("dark", "light");
    inner.classList.add(theme === "light" ? "light" : "dark");
}

// Güçlü şifre kontrolü
function isStrongPassword(password) {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return strongPasswordRegex.test(password);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (isLocalUserSession()) {
        updateProfileButton();
        updateAccountUI();
    }
    updateProfileButton();
    updateAccountUI();

    // Login (yerel)
    document.getElementById("accountLoginBtn").onclick = async () => {
        const username = document.getElementById("accountUsername").value.trim();
        const password = document.getElementById("accountPassword").value.trim();
        const errorMsg = document.getElementById("accountError");
        const lang = localStorage.getItem("language") || "tr";
        errorMsg.style.display = "none";

        // Rate Limiting kontrolü
        const rateLimit = checkRateLimit();
        if (rateLimit.isLocked) {
            errorMsg.textContent = rateLimit.message;
            errorMsg.style.display = "block";
            return;
        }

        if (!username || !isStrongPassword(password)) {
            errorMsg.textContent = translations[lang]?.accountError || "Kullanıcı adı ve şifre en az 6 karakter olmalı, büyük harf, küçük harf ve rakam içermeli.";
            errorMsg.style.display = "block";
            recordFailedAttempt();
            return;
        }

        if (storedUsers[username] && storedUsers[username].password === password) {
            localStorage.setItem("accountUsername", username);
            const originalName = localStorage.getItem("originalUsername") || username;
            localStorage.setItem("originalUsername", originalName);
            updateProfileButton();
            closeAccountPanel();
            resetRateLimit();
            console.log(`Giriş başarılı: ${username}`);
        } else {
            errorMsg.textContent = translations[lang]?.accountError || "Hatalı kullanıcı adı veya şifre.";
            errorMsg.style.display = "block";
            recordFailedAttempt();
        }
    };

    // Register (yerel)
    document.getElementById("accountRegisterBtn").onclick = async () => {
        const username = document.getElementById("accountUsername").value.trim();
        const password = document.getElementById("accountPassword").value.trim();
        const errorMsg = document.getElementById("accountError");
        const lang = localStorage.getItem("language") || "tr";
        errorMsg.style.display = "none";

        // Rate Limiting kontrolü
        const rateLimit = checkRateLimit();
        if (rateLimit.isLocked) {
            errorMsg.textContent = rateLimit.message;
            errorMsg.style.display = "block";
            return;
        }

        if (!username || !isStrongPassword(password)) {
            errorMsg.textContent = translations[lang]?.accountError || "Kullanıcı adı ve şifre en az 6 karakter olmalı, büyük harf, küçük harf ve rakam içermeli.";
            errorMsg.style.display = "block";
            recordFailedAttempt();
            return;
        }

        if (isInappropriateUsername(username)) {
            errorMsg.textContent = translations[lang]?.inappropriateUsername || "Bu kullanıcı adı uygunsuz veya geçersiz.";
            errorMsg.style.display = "block";
            console.log(`Kayıt engellendi: Uygunsuz kullanıcı adı: ${username}`);
            recordFailedAttempt();
            return;
        }

        if (storedUsers[username]) {
            errorMsg.textContent = translations[lang]?.usernameTaken || "Bu kullanıcı adı zaten alınmış.";
            errorMsg.style.display = "block";
            recordFailedAttempt();
            return;
        }

        storedUsers[username] = { password };
        localStorage.setItem("users", JSON.stringify(storedUsers));
        localStorage.setItem("accountUsername", username);
        localStorage.setItem("originalUsername", username);
        updateProfileButton();
        closeAccountPanel();
        resetRateLimit();
        console.log(`Kayıt başarılı: ${username}`);
    };

    // Ad değiştir (yerel + Google)
    document.getElementById("saveNameBtn").onclick = async () => {
        const newName = document.getElementById("editNameInput").value.trim();
        const username = localStorage.getItem("accountUsername");
        const errorMsg = document.getElementById("accountError");
        const lang = localStorage.getItem("language") || "tr";
        errorMsg.style.display = "none";

        if (!newName) {
            errorMsg.textContent = translations[lang]?.accountError || "Kullanıcı adı boş olamaz.";
            errorMsg.style.display = "block";
            return;
        }

        // Yerel hesaplar için uygunsuz isim kontrolü
        const user = auth.currentUser;
        const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
        if (isLocal && isInappropriateUsername(newName)) {
            errorMsg.textContent = translations[lang]?.inappropriateUsername || "Bu kullanıcı adı uygunsuz veya geçersiz.";
            errorMsg.style.display = "block";
            console.log(`İsim değiştirme engellendi: Uygunsuz kullanıcı adı: ${newName}`);
            return;
        }

        if (newName && username) {
            localStorage.setItem("accountUsername", newName);
            if (user && user.providerData[0]?.providerId === "google.com") {
                try {
                    await updateProfile(user, { displayName: newName });
                } catch (error) {
                    console.error("Ad değiştirme hatası:", error);
                    errorMsg.textContent = translations[lang]?.nameChangeError || "Ad değiştirme başarısız.";
                    errorMsg.style.display = "block";
                    return;
                }
            }
            updateAccountUI();
            alert(translations[lang]?.nameChanged || "Ad değiştirildi!");
        }
    };

    // Geri çevir
    document.getElementById("revertNameBtn").onclick = async () => {
        const originalName = localStorage.getItem("originalUsername");
        const user = auth.currentUser;
        const errorMsg = document.getElementById("accountError");
        const lang = localStorage.getItem("language") || "tr";
        errorMsg.style.display = "none";

        if (originalName) {
            // Yerel hesaplar için uygunsuz isim kontrolü
            const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
            if (isLocal && isInappropriateUsername(originalName)) {
                errorMsg.textContent = translations[lang]?.inappropriateUsername || "Orijinal kullanıcı adı uygunsuz veya geçersiz.";
                errorMsg.style.display = "block";
                console.log(`Geri çevirme engellendi: Uygunsuz kullanıcı adı: ${originalName}`);
                return;
            }
            localStorage.setItem("accountUsername", originalName);
            if (user && user.providerData[0]?.providerId === "google.com") {
                try {
                    await updateProfile(user, { displayName: originalName });
                } catch (error) {
                    console.error("Geri çevirme hatası:", error);
                    errorMsg.textContent = translations[lang]?.nameRevertError || "Orijinal ad geri yüklenemedi.";
                    errorMsg.style.display = "block";
                    return;
                }
            }
            updateAccountUI();
            document.getElementById("revertNameBtn").style.display = "none";
            alert(translations[lang]?.nameReverted || "Orijinal ad geri yüklendi!");
        }
    };

    // Profil resmi yükle (sadece yerel)
    document.getElementById("uploadPicBtn").onclick = () => {
        const user = auth.currentUser;
        const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
        const lang = localStorage.getItem("language") || "tr";
        if (!isLocal) {
            alert(translations[lang]?.googlePicError || "Google hesaplarında resim değiştirilemez.");
            return;
        }
        const input = document.getElementById("profilePicInput");
        input.value = "";
        input.style.display = "block";
        input.click();
        document.getElementById("removePicBtn").style.display = "block";
    };

    document.getElementById("profilePicInput").onchange = (e) => {
        const user = auth.currentUser;
        const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
        const input = document.getElementById("profilePicInput");
        const lang = localStorage.getItem("language") || "tr";
        if (!isLocal) {
            alert(translations[lang]?.googlePicError || "Google hesaplarında resim değiştirilemez.");
            e.target.value = "";
            input.style.display = "none";
            return;
        }
        const file = e.target.files[0];
        if (file) {
            // Dosya türü kontrolü (sadece resim)
            if (!file.type.startsWith('image/')) {
                alert(translations[lang]?.invalidFileType || "Sadece resim dosyaları yüklenebilir (PNG, JPEG, GIF).");
                e.target.value = "";
                input.style.display = "none";
                return;
            }
            // Dosya boyutu kontrolü (<5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert(translations[lang]?.fileTooLarge || "Dosya boyutu 5MB'dan büyük olamaz.");
                e.target.value = "";
                input.style.display = "none";
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = document.getElementById("picPreview");
                preview.innerHTML = `<img src="${ev.target.result}" style="width: 50px; height: 50px; border-radius: 50%;">`;
                document.getElementById("savePicBtn").style.display = "block";
            };
            reader.readAsDataURL(file);
            window.selectedFile = file;
        }
        input.style.display = "none";
    };

    document.getElementById("savePicBtn").onclick = async () => {
        const file = window.selectedFile;
        const user = auth.currentUser;
        const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
        const lang = localStorage.getItem("language") || "tr";
        if (!isLocal) {
            alert(translations[lang]?.googlePicError || "Google hesaplarında resim değiştirilemez.");
            return;
        }
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                localStorage.setItem("profilePic", ev.target.result);
                updateProfileButton();
                alert(translations[lang]?.picSaved || "Profil resmi kaydedildi!");
                closeAccountPanel();
            };
            reader.readAsDataURL(file);
        }
    };

    // Resmi kaldır (yerel)
    document.getElementById("removePicBtn").onclick = () => {
        const user = auth.currentUser;
        const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
        const lang = localStorage.getItem("language") || "tr";
        if (!isLocal) {
            alert(translations[lang]?.googlePicError || "Google hesaplarında resim değiştirilemez.");
            return;
        }
        localStorage.removeItem("profilePic");
        updateProfileButton();
        document.getElementById("picPreview").innerHTML = "";
        document.getElementById("removePicBtn").style.display = "none";
        alert(translations[lang]?.picRemoved || "Profil resmi kaldırıldı!");
    };

    // Logout
    document.getElementById("accountLogoutBtn").onclick = () => {
        const user = auth.currentUser;
        const lang = localStorage.getItem("language") || "tr";
        if (user && user.providerData[0]?.providerId === "google.com") {
            signOut(auth).then(() => {
                closeAccountPanel();
                updateProfileButton();
                alert(translations[lang]?.loggedOut || "Başarıyla çıkış yapıldı!");
            }).catch((error) => {
                console.error("Çıkış hatası:", error);
                const errorMsg = document.getElementById("accountError");
                errorMsg.textContent = translations[lang]?.logoutError || "Çıkış yapılamadı.";
                errorMsg.style.display = "block";
            });
        } else {
            localStorage.removeItem("accountUsername");
            localStorage.removeItem("originalUsername");
            localStorage.removeItem("profilePic");
            closeAccountPanel();
            updateProfileButton();
            alert(translations[lang]?.loggedOut || "Başarıyla çıkış yapıldı!");
        }
    };

    // Google Login
    document.getElementById("googleLoginBtn").onclick = async () => {
        const provider = new GoogleAuthProvider();
        const lang = localStorage.getItem("language") || "tr";

        signInWithPopup(auth, provider)
            .then((result) => {
                const username = result.user.displayName || result.user.email.split('@')[0];
                // Google hesapları için kullanıcı adı filtrelemesi kaldırıldı
                localStorage.setItem("accountUsername", username);
                localStorage.setItem("originalUsername", username);
                closeAccountPanel();
                resetRateLimit();
                alert(translations[lang]?.loggedIn || "Google ile giriş başarılı!");
            })
            .catch((error) => {
                console.error("Google giriş hatası:", error);
                const errorMsg = document.getElementById("accountError");
                errorMsg.textContent = translations[lang]?.googleLoginError || "Google ile giriş yapılamadı.";
                errorMsg.style.display = "block";
                recordFailedAttempt();
            });
    };
});

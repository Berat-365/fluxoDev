import { translations } from './language.js';
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Firebase init (sadece Google için)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Local users storage
let storedUsers = JSON.parse(localStorage.getItem("users") || "{}");

// Buton güncelle fonksiyonu
function updateProfileButton() {
  const username = localStorage.getItem("accountUsername");
  const btn = document.getElementById("accountButton");
  // Tema kontrolü
  const theme = localStorage.getItem("theme") || "dark";
  const accountIcon = theme === "light" ? "assets/dark/account-dark.png" : "assets/light/account.png";
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
  // If there is no Firebase user and accountUsername exists, it's a local session
  return !auth.currentUser && !!localStorage.getItem("accountUsername");
}

// Auth state observer (sadece Google için)
onAuthStateChanged(auth, (user) => {
  if (user && user.providerData[0]?.providerId === "google.com") {
    let username = user.displayName || user.email.split('@')[0];
    localStorage.setItem("accountUsername", username);
    const originalName = localStorage.getItem("originalUsername");
    if (originalName && username !== originalName) {
      document.getElementById("revertNameBtn").style.display = "block";
    } else {
      document.getElementById("revertNameBtn").style.display = "none";
    }
    // Profil resmini butona uygula (Google için)
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
  } else if (!user) {
    // Only clear if previous session was Google, not local
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
        // Resim yükleme ve kaldırma alanları sadece yerel kullanıcılar için görünsün
        const user = auth.currentUser;
        let isLocal = true;
        if (user && user.providerData[0]?.providerId === "google.com") {
            isLocal = false;
        }
        // Alanlar sadece yerel kullanıcıda görünsün, Google'da tamamen gizle
        document.getElementById("uploadPicBtn").style.display = isLocal ? "block" : "none";
        document.querySelector('.profile-edit input[type="file"]').style.display = isLocal ? "block" : "none";
        document.getElementById("removePicBtn").style.display = (isLocal && localStorage.getItem("profilePic")) ? "block" : "none";
        document.getElementById("savePicBtn").style.display = (isLocal && window.selectedFile) ? "block" : "none";
        document.getElementById("picPreview").style.display = isLocal ? "block" : "none";
        // --- Hide/show the label for profilePicInput ---
        const picLabel = document.querySelector('label[for="profilePicInput"].section-label');
        if (picLabel) {
            picLabel.style.display = isLocal ? "block" : "none";
        }
        // Devre dışı bırakma (disable) işlemi
        document.getElementById("uploadPicBtn").disabled = !isLocal;
        document.querySelector('.profile-edit input[type="file"]').disabled = !isLocal;
        document.getElementById("removePicBtn").disabled = !isLocal;
        document.getElementById("savePicBtn").disabled = !isLocal;
        // Google kullanıcıları için önizlemeyi de temizle
        if (!isLocal) {
            document.getElementById("picPreview").innerHTML = "";
        }
    } else {
        document.getElementById("accountForm").style.display = "flex";
        document.getElementById("accountLoggedIn").style.display = "none";
        document.getElementById("accountUsername").value = "";
        document.getElementById("accountPassword").value = "";
        // --- Also hide the label when not logged in ---
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
    // Profil resmi input'unu temizle ve gizle
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // On page load, restore local user session if present
  if (isLocalUserSession()) {
    updateProfileButton();
    updateAccountUI();
  }

  // Sayfa yüklendiğinde UI'yi güncelle (yerel girişler için)
  updateProfileButton();
  updateAccountUI();

  // Login (yerel)
  document.getElementById("accountLoginBtn").onclick = () => {
    const username = document.getElementById("accountUsername").value.trim();
    const password = document.getElementById("accountPassword").value.trim();
    const errorMsg = document.getElementById("accountError");
    const lang = localStorage.getItem("language") || "tr";
    errorMsg.style.display = "none";

    if (!username || password.length < 6) {
      errorMsg.textContent = translations[lang]?.accountError || "Kullanıcı adı ve şifre en az 6 karakter.";
      errorMsg.style.display = "block";
      return;
    }

    if (storedUsers[username] && storedUsers[username].password === password) {
      localStorage.setItem("accountUsername", username);
      const originalName = localStorage.getItem("originalUsername") || username;
      localStorage.setItem("originalUsername", originalName);
      updateProfileButton();
      closeAccountPanel();
    } else {
      errorMsg.textContent = translations[lang]?.accountError || "Hatalı kullanıcı adı veya şifre.";
      errorMsg.style.display = "block";
    }
  };

  // Register (yerel)
  document.getElementById("accountRegisterBtn").onclick = () => {
    const username = document.getElementById("accountUsername").value.trim();
    const password = document.getElementById("accountPassword").value.trim();
    const errorMsg = document.getElementById("accountError");
    const lang = localStorage.getItem("language") || "tr";
    errorMsg.style.display = "none";

    if (!username || password.length < 6) {
      errorMsg.textContent = translations[lang]?.accountError || "Kullanıcı adı ve şifre en az 6 karakter.";
      errorMsg.style.display = "block";
      return;
    }

    if (storedUsers[username]) {
      errorMsg.textContent = translations[lang]?.usernameTaken || "Bu kullanıcı adı zaten alınmış.";
      errorMsg.style.display = "block";
      return;
    }

    storedUsers[username] = { password };
    localStorage.setItem("users", JSON.stringify(storedUsers));
    localStorage.setItem("accountUsername", username);
    localStorage.setItem("originalUsername", username);
    updateProfileButton();
    closeAccountPanel();
  };

  // Ad değiştir (yerel + Google)
  document.getElementById("saveNameBtn").onclick = async () => {
    const newName = document.getElementById("editNameInput").value.trim();
    const username = localStorage.getItem("accountUsername");
    const user = auth.currentUser;
    if (newName && username) {
      localStorage.setItem("accountUsername", newName);
      if (user && user.providerData[0]?.providerId === "google.com") {
        try {
          await updateProfile(user, { displayName: newName });
        } catch (error) {
          console.error("Ad değiştirme hatası:", error);
        }
      }
      updateAccountUI();
      alert("Ad değiştirildi!");
    }
  };

  // Geri çevir
  document.getElementById("revertNameBtn").onclick = async () => {
    const originalName = localStorage.getItem("originalUsername");
    const user = auth.currentUser;
    if (originalName) {
      localStorage.setItem("accountUsername", originalName);
      if (user && user.providerData[0]?.providerId === "google.com") {
        try {
          await updateProfile(user, { displayName: originalName });
        } catch (error) {
          console.error("Geri çevirme hatası:", error);
        }
      }
      updateAccountUI();
      document.getElementById("revertNameBtn").style.display = "none";
      alert("Orijinal ad geri yüklendi!");
    }
  };

  // Profil resmi yükle (sadece yerel)
  document.getElementById("uploadPicBtn").onclick = () => {
    const user = auth.currentUser;
    const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
    if (!isLocal) {
      alert("Google hesaplarında resim değiştirilemez.");
      return;
    }
    const input = document.getElementById("profilePicInput");
    input.value = ""; // Dosya seçimini temizle
    input.style.display = "block"; // Gerekirse tekrar göster
    input.click();
    document.getElementById("removePicBtn").style.display = "block";  // Kaldırma butonu göster
  };

  document.getElementById("profilePicInput").onchange = (e) => {
    const user = auth.currentUser;
    const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
    const input = document.getElementById("profilePicInput");
    if (!isLocal) {
      alert("Google hesaplarında resim değiştirilemez.");
      e.target.value = ""; // Dosya seçimini temizle
      input.style.display = "none"; // Input'u gizle
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const preview = document.getElementById("picPreview");
        preview.innerHTML = `<img src="${ev.target.result}" style="width: 50px; height: 50px; border-radius: 50%;">`;
        document.getElementById("savePicBtn").style.display = "block";
      };
      reader.readAsDataURL(file);
      window.selectedFile = file;
    }
    // Dosya seçildikten sonra input'u gizle
    input.style.display = "none";
  };

  document.getElementById("savePicBtn").onclick = async () => {
    const file = window.selectedFile;
    const user = auth.currentUser;
    const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
    if (!isLocal) {
      alert("Google hesaplarında resim değiştirilemez.");
      return;
    }
    if (file) {
      // Local resim sakla (base64)
      const reader = new FileReader();
      reader.onload = (ev) => {
        localStorage.setItem("profilePic", ev.target.result);
        updateProfileButton();
        alert("Profil resmi kaydedildi!");
        closeAccountPanel();
      };
      reader.readAsDataURL(file);
    }
  };

  // Resmi kaldır (yerel)
  document.getElementById("removePicBtn").onclick = () => {
    const user = auth.currentUser;
    const isLocal = !user || user.providerData[0]?.providerId !== "google.com";
    if (!isLocal) {
      alert("Google hesaplarında resim değiştirilemez.");
      return;
    }
    localStorage.removeItem("profilePic");
    updateProfileButton();
    document.getElementById("picPreview").innerHTML = "";
    document.getElementById("removePicBtn").style.display = "none";
    alert("Profil resmi kaldırıldı!");
  };

  // Logout
  document.getElementById("accountLogoutBtn").onclick = () => {
    const user = auth.currentUser;
    if (user && user.providerData[0]?.providerId === "google.com") {
      signOut(auth).then(() => {
        closeAccountPanel();
        updateProfileButton();
      });
    } else {
      localStorage.removeItem("accountUsername");
      localStorage.removeItem("originalUsername");
      localStorage.removeItem("profilePic");
      closeAccountPanel();
      updateProfileButton();
    }
  };

  // Google Login
  document.getElementById("googleLoginBtn").onclick = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const username = result.user.displayName || result.user.email.split('@')[0];
        localStorage.setItem("accountUsername", username);
        localStorage.setItem("originalUsername", username);
        closeAccountPanel();
      })
      .catch((error) => {
        console.error("Google error:", error);
      });
  };
});

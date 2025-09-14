// settings.js
export function selectColor(color) {
    console.log("Seçilen renk:", color);
    document.getElementById("accentColor").value = color;
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem("accentColor", color);
}

export function rgbToHex(rgb) {
    if (!rgb) return '#000000';
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return '#' + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1).toUpperCase();
}

export function updateSearchEnginePreview() {
    const engine = document.getElementById("searchEngineSelect").value;
    const preview = document.getElementById("engineLogo");
    const logos = {
        google: "https://www.google.com/favicon.ico",
        bing: "https://www.bing.com/favicon.ico",
        duckduckgo: "https://duckduckgo.com/favicon.ico",
        yandex: "https://yandex.com/favicon.ico",
        brave: "https://brave.com/favicon.ico",
        wikipedia: "https://www.wikipedia.org/static/favicon/wikipedia.ico",
        yahoo: "https://www.yahoo.com/favicon.ico"
    };
    preview.src = logos[engine] || "";
    preview.style.display = logos[engine] ? "block" : "none";
}

export function bindShortcuts() {
    let handleShortcuts = null;
    if (handleShortcuts) {
        document.removeEventListener("keydown", handleShortcuts);
    }

    const searchShortcut = localStorage.getItem("searchShortcut") || "Ctrl + /";
    const favoriteShortcut = localStorage.getItem("favoriteShortcut") || "Ctrl + Shift + F";
    const settingsShortcut = localStorage.getItem("settingsShortcut") || "Ctrl + Shift + X";
    const historyShortcut = localStorage.getItem("historyShortcut") || "Ctrl + Shift + H";
    const imagesShortcut = localStorage.getItem("imagesShortcut") || "Ctrl + I";
    const shoppingShortcut = localStorage.getItem("shoppingShortcut") || "Ctrl + S";
    const newsShortcut = localStorage.getItem("newsShortcut") || "Ctrl + N";
    const accountShortcut = localStorage.getItem("accountShortcut") || "Ctrl + Shift + A";
    const aiShortcut = localStorage.getItem("aiShortcut") || "Ctrl + Shift + I";

    handleShortcuts = (e) => {
     const keyCombo = `${e.ctrlKey ? 'Ctrl + ' : ''}${e.shiftKey ? 'Shift + ' : ''}${(e.key || '').toUpperCase()}`;
        if (keyCombo === searchShortcut) {
            e.preventDefault();
            document.getElementById("searchInput").focus();
        } else if (keyCombo === favoriteShortcut) {
            e.preventDefault();
            document.getElementById("addFavoriteModal").style.display = "block";
            document.getElementById("modalName").focus();
        } else if (keyCombo === settingsShortcut) {
            e.preventDefault();
            const p = document.getElementById("menuPanel");
            p.style.display = p.style.display === "block" ? "none" : "block";
            document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
            document.getElementById("settingsContent").classList.add("active");
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            document.querySelector(".tab-button[data-tab='settings']").classList.add("active");
        } else if (keyCombo === historyShortcut) {
            e.preventDefault();
            const p = document.getElementById("menuPanel");
            p.style.display = p.style.display === "block" ? "none" : "block";
            document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
            document.getElementById("historyContent").classList.add("active");
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            document.querySelector(".tab-button[data-tab='history']").classList.add("active");
            loadSearchHistory();
        } else if (keyCombo === imagesShortcut && document.getElementById("searchInput").value.trim()) {
            e.preventDefault();
            search('images');
        } else if (keyCombo === shoppingShortcut && document.getElementById("searchInput").value.trim()) {
            e.preventDefault();
            search('shopping');
        } else if (keyCombo === newsShortcut && document.getElementById("searchInput").value.trim()) {
            e.preventDefault();
            search('news');
        } else if (keyCombo === aiShortcut && document.getElementById("searchInput").value.trim()) {
            e.preventDefault();
            search('ai');
        }
    };

    document.addEventListener("keydown", handleShortcuts);
}

export async function cacheBackgroundImage(url) {
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    if (isYouTube) {
        localStorage.setItem(`bgCache_${url}`, url);
        return;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch background image");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            localStorage.setItem(`bgCache_${url}`, reader.result);
        };
    } catch (e) {
        console.error("Arka plan önbellekleme hatası:", e);
    }
}

export function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export function loadCachedBackground(url) {
    const videoElement = document.getElementById('backgroundVideo');
    const youTubeElement = document.getElementById('backgroundYouTube');
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);

    if (isYouTube) {
        videoElement.style.display = 'none';
        videoElement.pause && videoElement.pause();
        videoElement.querySelector('source').src = '';
        videoElement.load && videoElement.load();

        const cached = localStorage.getItem(`bgCache_${url}`);
        const videoId = extractYouTubeId(cached || url);
        if (videoId) {
            youTubeElement.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&playsinline=1&rel=0&iv_load_policy=3&vq=hd720`;
            youTubeElement.style.display = 'block';
            document.body.style.backgroundImage = 'none';
            // Dinamik ölçeklendirme
            const aspectRatio = window.innerWidth / window.innerHeight;
            youTubeElement.style.transform = aspectRatio < 1.6 ? 'scale(1.15)' : 'scale(1.1)';
            cacheBackgroundImage(url);

            // YouTube yükleme hatası için kontrol
            youTubeElement.onerror = () => {
                console.error("YouTube iframe yüklenemedi:", url);
                alert("YouTube videosu yüklenemedi. Reklam engelleyicinizi kapatmayı veya başka bir video URL'si denemeyi deneyin.");
                youTubeElement.style.display = 'none';
                youTubeElement.src = '';
                document.body.style.backgroundImage = 'none';
            };
        } else {
            console.error("Geçersiz YouTube URL'si:", cached || url);
            alert("Geçersiz YouTube URL'si. Lütfen geçerli bir video bağlantısı girin.");
            youTubeElement.style.display = 'none';
            youTubeElement.src = '';
            document.body.style.backgroundImage = 'none';
        }
    } else if (isVideo) {
        youTubeElement.style.display = 'none';
        youTubeElement.src = '';

        const cached = localStorage.getItem(`bgCache_${url}`);
        if (cached) {
            videoElement.querySelector('source').src = cached;
        } else {
            videoElement.querySelector('source').src = url;
            cacheBackgroundImage(url);
        }
        videoElement.style.display = 'block';
        videoElement.load();
        videoElement.play && videoElement.play();
        document.body.style.backgroundImage = 'none';
    } else {
        videoElement.style.display = 'none';
        videoElement.pause && videoElement.pause();
        videoElement.querySelector('source').src = '';
        videoElement.load && videoElement.load();
        youTubeElement.style.display = 'none';
        youTubeElement.src = '';

        const cached = localStorage.getItem(`bgCache_${url}`);
        if (cached) {
            document.body.style.backgroundImage = `url('${cached}')`;
        } else if (url) {
            document.body.style.backgroundImage = `url('${url}')`;
            cacheBackgroundImage(url);
        } else {
            document.body.style.backgroundImage = 'none';
        }
    }

    // Pencere yeniden boyutlandırıldığında ölçeklendirmeyi güncelle
    window.addEventListener('resize', () => {
        if (isYouTube && youTubeElement.style.display === 'block') {
            const aspectRatio = window.innerWidth / window.innerHeight;
            youTubeElement.style.transform = aspectRatio < 1.6 ? 'scale(1.15)' : 'scale(1.1)';
        }
    }, { once: true });
}

export function applySettings(loadCachedBackground, updateLanguage, loadFavorites, updateSearchEnginePreview, fetchWeather, bindShortcuts, startWeatherUpdate) {
    // 1. Input'lardan ayarları al ve localStorage'a kaydet
    const bg = document.getElementById("bgUrlInput").value.trim() || localStorage.getItem("bgUrl") || '';
    const f = document.getElementById("fontSelect").value;
    const t = document.getElementById("themeSelect").value;
    const c = document.getElementById("accentColor").value;
    const l = document.getElementById("languageSelect").value;
    const se = document.getElementById("searchEngineSelect").value;
    const sf = document.getElementById("showFavorites").value;
    const ss = document.getElementById("showSuggestions").value;
    const sw = document.getElementById("showWeather").value;
    const si = document.getElementById("showInfoBar").value;
    const ssearch = document.getElementById("showSearch").value; // Arama barı için
    const ssearchshort = document.getElementById("showSearchShortcuts").value; // Kısayol butonları için
    const saisearch = document.getElementById("showAISearch").value;
    const sabutton = document.getElementById("showAccountButton").value;
    const sainfo = document.getElementById("showAccountInfoText").value;
    const ld = document.getElementById("logoDisplaySelect").value;
    const lp = document.getElementById("logoPositionSelect").value;
    const lnc = document.getElementById("logoNameColorSelect").value;
    const maxFav = document.getElementById("maxFavorites").value;
    const searchShortcut = document.getElementById("searchShortcutInput").value.trim();
    const favoriteShortcut = document.getElementById("favoriteShortcutInput").value.trim();
    const settingsShortcut = document.getElementById("settingsShortcutInput").value.trim();
    const historyShortcut = document.getElementById("historyShortcutInput").value.trim();
    const imagesShortcut = document.getElementById("imagesShortcutInput").value.trim();
    const shoppingShortcut = document.getElementById("shoppingShortcutInput").value.trim();
    const newsShortcut = document.getElementById("newsShortcutInput").value.trim();
    const accountShortcut = document.getElementById("accountShortcutInput").value.trim();
    const aiShortcut = document.getElementById("aiShortcutInput").value.trim();
    const weatherLocation = document.getElementById("weatherLocation").value.trim();
    const weatherUpdateInterval = document.getElementById("weatherUpdateInterval").value;
    const linkBehavior = document.getElementById("linkBehavior").value;
    const aiProvider = document.getElementById("aiProviderSelect").value;
    const customAiUrl = document.getElementById("customAiUrl").value.trim();
    const weatherAPI = document.getElementById("weatherAPI").value;
    const openWeatherMapApiKey = document.getElementById("openWeatherMapApiKey").value;
    const weatherApiKey = document.getElementById("weatherApiKey").value;
    const visualCrossingApiKey = document.getElementById("visualCrossingApiKey").value;

    localStorage.setItem("bgUrl", bg);
    localStorage.setItem("font", f);
    localStorage.setItem("theme", t);
    localStorage.setItem("accentColor", c);
    localStorage.setItem("language", l);
    localStorage.setItem("searchEngine", se);
    localStorage.setItem("showFavorites", sf);
    localStorage.setItem("showSuggestions", ss);
    localStorage.setItem("showWeather", sw);
    localStorage.setItem("showInfoBar", si);
    localStorage.setItem("showSearch", ssearch); // Yeni: Arama barı
    localStorage.setItem("showSearchShortcuts", ssearchshort); // Yeni: Arama kısayolları
    localStorage.setItem("showAISearch", saisearch);
    localStorage.setItem("showAccountButton", sabutton);
    localStorage.setItem("showAccountInfoText", sainfo);
    localStorage.setItem("logoDisplay", ld);
    localStorage.setItem("logoPosition", lp);
    localStorage.setItem("logoNameColor", lnc);
    localStorage.setItem("maxFavorites", maxFav);
    localStorage.setItem("searchShortcut", searchShortcut);
    localStorage.setItem("favoriteShortcut", favoriteShortcut);
    localStorage.setItem("settingsShortcut", settingsShortcut);
    localStorage.setItem("historyShortcut", historyShortcut);
    localStorage.setItem("imagesShortcut", imagesShortcut);
    localStorage.setItem("shoppingShortcut", shoppingShortcut);
    localStorage.setItem("newsShortcut", newsShortcut);
    localStorage.setItem("accountShortcut", accountShortcut);
    localStorage.setItem("aiShortcut", aiShortcut);
    localStorage.setItem("weatherLocation", weatherLocation);
    localStorage.setItem("weatherUpdateInterval", weatherUpdateInterval);
    localStorage.setItem("linkBehavior", linkBehavior);
    localStorage.setItem("aiProvider", aiProvider);
    localStorage.setItem("customAiUrl", customAiUrl);
    localStorage.setItem("weatherAPI", weatherAPI);
    localStorage.setItem("openWeatherMapApiKey", openWeatherMapApiKey);
    localStorage.setItem("weatherApiKey", weatherApiKey);
    localStorage.setItem("visualCrossingApiKey", visualCrossingApiKey);

    // 2. localStorage'dan ayarları oku ve uygula
    const font = localStorage.getItem("font") || "'Ubuntu', sans-serif";
    const theme = localStorage.getItem("theme") || "dark";
    const accentColor = localStorage.getItem("accentColor") || "#4CAF99";
    const language = localStorage.getItem("language") || "tr";
    const searchEngine = localStorage.getItem("searchEngine") || "google";
    const showFavorites = localStorage.getItem("showFavorites") || "true";
    const showSuggestions = localStorage.getItem("showSuggestions") || "true";
    const showWeather = localStorage.getItem("showWeather") || "true";
    const showInfoBar = localStorage.getItem("showInfoBar") || "true";
    const showSearch = localStorage.getItem("showSearch") || "true";
    const showSearchShortcuts = localStorage.getItem("showSearchShortcuts") || "true";
    const showAISearch = localStorage.getItem("showAISearch") || "true";
    const showAccountButton = localStorage.getItem("showAccountButton") || "true";
    const showAccountInfoText = localStorage.getItem("showAccountInfoText") || "true";
    const logoDisplay = localStorage.getItem("logoDisplay") || "logo-name";
    const logoPosition = localStorage.getItem("logoPosition") || "center";
    const logoNameColor = localStorage.getItem("logoNameColor") || "lightFont";

    // Uygula
    loadCachedBackground(bg);
    document.documentElement.style.setProperty('--site-font', font);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    const logoImg = document.getElementById("logoImg");
    const logoName = document.getElementById("logoName");
    const searchIcon = document.getElementById("searchIcon");
    const voiceIcon = document.getElementById("voiceIcon");
    const accountIcon = document.getElementById("accountIcon");
    const menuIcon = document.getElementById("menuIcon");
    logoImg.src = theme === "light" ? "ico/logo-dark.png" : "ico/logo.png";
    searchIcon.src = theme === "light" ? "ico/search-dark.png" : "ico/search.png";
    voiceIcon.src = theme === "light" ? "ico/mic-dark.png" : "ico/mic.png";
    menuIcon.src = theme === "light" ? "ico/menu-dark.png" : "ico/menu.png";
    accountIcon.src = theme === "light" ? "ico/account-dark.png" : "ico/account.png";

    // Görünürlük ayarları
    document.getElementById("searchBar").style.display = showSearch === "true" ? "flex" : "none";
    document.getElementById("buttons").style.display = showSearchShortcuts === "true" ? "flex" : "none"; // Arama kısayol butonları (Ara, Görseller, vb.)
    document.getElementById("favorites").style.display = showFavorites === "true" ? "flex" : "none";
    document.getElementById("infoBar").style.display = showInfoBar === "true" ? "block" : "none";
    document.getElementById("weatherWidget").style.display = showWeather === "true" ? "block" : "none";
    document.getElementById("accountButton").style.display = showAccountButton === "true" ? "block" : "none";
    document.getElementById("accountInfo").style.display = showAccountInfoText === "true" && localStorage.getItem("accountUsername") ? "inline" : "none";
    document.getElementById("searchAIBtn").style.display = showAISearch === "true" ? "inline-block" : "none";

    // Logo ayarları
    if (logoDisplay === "logo") {
        logoImg.style.display = "block";
        logoName.style.display = "none";
    } else if (logoDisplay === "logo-name") {
        logoImg.style.display = "block";
        logoName.style.display = "inline";
    } else {
        logoImg.style.display = "none";
        logoName.style.display = "none";
    }
    const logoContainer = document.getElementById("logo").parentElement;
    logoContainer.style.justifyContent = logoPosition === "left" ? "flex-start" : logoPosition === "right" ? "flex-end" : "center";
    logoName.classList.remove("lightFont", "darkFont");
    logoName.classList.add(logoNameColor);

    // Hava durumu
    if (showWeather === "true" && weatherLocation) {
        fetchWeather();
        startWeatherUpdate();
    } else {
        document.getElementById("weatherWidget").innerHTML = `<span class="weather-error">${translations[language]?.weatherError || "Hava durumu alınamadı"}</span>`;
    }

    // Diğer işlemler
    let recentBgs = JSON.parse(localStorage.getItem("recentBackgrounds") || "[]");
    recentBgs = recentBgs.filter(url => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    });
    if (bg && !recentBgs.includes(bg)) {
        recentBgs.unshift(bg);
        if (recentBgs.length > 5) recentBgs.pop();
        localStorage.setItem("recentBackgrounds", JSON.stringify(recentBgs));
    }

    updateLanguage(language);
    loadFavorites();
    updateSearchEnginePreview();
    bindShortcuts();
}

let isFetchingWeather = false;

export async function fetchWeather() {
    if (isFetchingWeather) {
        console.log("Hava durumu sorgusu zaten işleniyor, atlanıyor...");
        return;
    }

    isFetchingWeather = true;
    const widget = document.getElementById("weatherWidget");
    const location = localStorage.getItem("weatherLocation");
    const api = localStorage.getItem("weatherAPI") || "wttrin";
    const lang = localStorage.getItem("language") || "tr";

    // Varsayılan çeviriler
    const defaultTranslations = {
        tr: {
            weatherError: "Hava durumu alınamadı",
            loading: "Yükleniyor...",
            noLocation: "Lütfen bir konum girin"
        },
        en: {
            weatherError: "Unable to fetch weather",
            loading: "Loading...",
            noLocation: "Please enter a location"
        }
    };

    // translations yoksa varsayılanı kullan
    const t = typeof translations !== "undefined" ? translations : defaultTranslations;

    try {
        // Konum yoksa istek atma
        if (!location || location.trim() === "") {
            widget.innerHTML = `<span class="weather-error">${t[lang]?.noLocation || "Lütfen bir konum girin"}</span>`;
            return;
        }

        widget.textContent = t[lang]?.loading || "Yükleniyor...";

        let url, responseHandler;
        if (api === "weatherapi") {
            const apiKey = localStorage.getItem("weatherApiKey");
            if (!apiKey) throw new Error("WeatherAPI anahtarı eksik. Lütfen ayarlar panelinden geçerli bir anahtar girin: https://www.weatherapi.com/");
            url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&lang=${lang}`;
            responseHandler = async (resp) => {
                if (!resp.ok) {
                    const errorText = await resp.text();
                    throw new Error(`HTTP hatası: ${resp.status} - ${errorText}`);
                }
                const data = await resp.json();
                if (data.error) throw new Error(`API hatası: ${data.error.message}`);
                return `${data.location.name}: ${data.current.condition.text}, ${data.current.temp_c}°C, Rüzgar: ${data.current.wind_kph} km/s`;
            };
        } else if (api === "wttrin") {
            url = `https://wttr.in/${encodeURIComponent(location)}?format=%l:+%C+%t+%w&lang=${lang}`;
            responseHandler = async (resp) => {
                if (!resp.ok) throw new Error(`HTTP hatası: ${resp.status} - wttr.in sunucusuna ulaşılamadı`);
                const text = await resp.text();
                if (!text.trim()) throw new Error("wttr.in boş yanıt döndü, konumu kontrol edin: " + location);
                const cleanedText = text.replace(/\+/g, ' ').trim();
                return cleanedText || `${location}: Veri alınamadı`;
            };
        } else if (api === "openmeteo") {
            const coords = await getCoordinates(location);
            url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`;
            responseHandler = async (resp) => {
                if (!resp.ok) throw new Error(`HTTP hatası: ${resp.status} - ${resp.statusText}`);
                const data = await resp.json();
                const weatherCodes = {
                    0: t[lang]?.weatherClear || "☀️",
                    1: t[lang]?.weatherPartlyCloudy || "🌤️",
                    2: t[lang]?.weatherCloudy || "☁️",
                    3: t[lang]?.weatherVeryCloudy || "🌥️",
                    45: t[lang]?.weatherFog || "🌫️",
                    61: t[lang]?.weatherLightRain || "🌦️",
                    63: t[lang]?.weatherRain || "🌧️",
                    80: t[lang]?.weatherShowers || "🌩️"
                };
                return `${location}: ${weatherCodes[data.current.weathercode] || "Bilinmeyen Hava"}, ${data.current.temperature_2m}°C, Rüzgar: ${data.current.windspeed_10m} km/s`;
            };
        } else {
            throw new Error("Desteklenmeyen hava durumu API'si: " + api);
        }

        console.log("Hava durumu isteği gönderiliyor:", url);
        const resp = await fetch(url, {
            headers: { Accept: api === "wttrin" ? "text/plain" : "application/json" }
        });
        const text = await responseHandler(resp);
        widget.textContent = text;
        widget.title = text;
    } catch (error) {
        widget.innerHTML = `<span class="weather-error">${t[lang]?.weatherError || "Hava durumu alınamadı"}: ${error.message}</span>`;
    } finally {
        isFetchingWeather = false;
    }
}

export function startWeatherUpdate() {
    const interval = parseInt(localStorage.getItem("weatherUpdateInterval") || "10") * 60 * 1000;
    if (interval === 0) return; // Manuel güncelleme
    fetchWeather();
    setInterval(fetchWeather, interval);
}
export function resetBrowser() {
    const lang = localStorage.getItem("language") || "tr";
    // translations fallback ekle
    const defaultTranslations = {
        tr: {
            resetConfirm: "Tüm ayarları ve verileri sıfırlamak istediğinize emin misiniz?",
            resetSuccess: "Tarayıcı başarıyla sıfırlandı!"
        },
        en: {
            resetConfirm: "Are you sure you want to reset all settings and data?",
            resetSuccess: "Browser successfully reset!"
        },
        es: {
            resetConfirm: "¿Estás seguro de que deseas restablecer todas las configuraciones y datos?",
            resetSuccess: "¡Navegador restablecido con éxito!"
        },
        fr: {
            resetConfirm: "Êtes-vous sûr de vouloir réinitialiser tous les paramètres et données ?",
            resetSuccess: "Navigateur réinitialisé avec succès !"
        },
        de: {
            resetConfirm: "Sind Sie sicher, dass Sie alle Einstellungen und Daten zurücksetzen möchten?",
            resetSuccess: "Browser erfolgreich zurückgesetzt!"
        },

    };
    // Eğer translations yoksa default'u kullan
    const t = typeof translations !== "undefined" ? translations : defaultTranslations;

    if (!confirm(t[lang]?.resetConfirm || "Tüm ayarları ve verileri sıfırlamak istediğinize emin misiniz?")) return;

    // localStorage'ı tamamen sil
    localStorage.clear();

    // Arka planı sıfırla
    document.body.style.backgroundImage = 'none';
    const videoElement = document.getElementById('backgroundVideo');
    const youTubeElement = document.getElementById('backgroundYouTube');
    if (videoElement) {
        videoElement.style.display = 'none';
        if (videoElement.pause) videoElement.pause();
        const source = videoElement.querySelector('source');
        if (source) source.src = '';
        if (videoElement.load) videoElement.load();
    }
    if (youTubeElement) {
        youTubeElement.style.display = 'none';
        youTubeElement.src = '';
    }

    // Onay mesajı göster
    alert(t[lang]?.resetSuccess || "Tarayıcı başarıyla sıfırlandı!");

    // Sayfayı yeniden yükle
    window.location.reload();
}
export function openImportExportModal() {
    document.getElementById("importExportModal").style.display = "block";
}

export function closeImportExportModal() {
    document.getElementById("importExportModal").style.display = "none";
}

export function exportSettings() {
    const settings = {};
    for (let key in localStorage) {
        settings[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fluxodev_settings.json";
    a.click();
    URL.revokeObjectURL(url);
    closeImportExportModal();
}

export function importSettings(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const settings = JSON.parse(evt.target.result);
            for (let key in settings) {
                localStorage.setItem(key, settings[key]);
            }
            applySettings(loadCachedBackground, updateLanguage, loadFavorites, updateSearchEnginePreview, fetchWeather, bindShortcuts, startWeatherUpdate);
            alert(translations[localStorage.getItem("language") || "tr"].importSuccess || "Ayarlar başarıyla yüklendi!");
            window.location.reload(); // Yeni ek: Değişiklikleri tam uygulamak için reload
        } catch (err) {
            alert(translations[localStorage.getItem("language") || "tr"].invalidFile || "Geçersiz dosya: " + err.message);
        }
        closeImportExportModal();
    };
    reader.readAsText(file);
}

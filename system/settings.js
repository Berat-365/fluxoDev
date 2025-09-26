// Renk seçimi
export function selectColor(color) {
    console.log("Seçilen renk:", color);
    document.getElementById("accentColor").value = color;
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem("accentColor", color);
}

// RGB'den HEX'e çevirme
export function rgbToHex(rgb) {
    if (!rgb) return '#000000';
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return '#' + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1).toUpperCase();
}

// Arama motoru önizlemesi
export function updateSearchEnginePreview() {
    const engine = document.getElementById("searchEngineSelect")?.value || "google";
    const preview = document.getElementById("engineLogo");
    const logos = {
        google: "https://www.google.com/favicon.ico",
        bing: "https://www.bing.com/favicon.ico",
        duckduckgo: "https://duckduckgo.com/favicon.ico",
        yandex: "https://yandex.com/favicon.ico",
        brave: "https://brave.com/favicon.ico",
        yahoo: "https://www.yahoo.com/favicon.ico"
    };
    if (preview) {
        preview.src = logos[engine] || "";
        preview.style.display = logos[engine] ? "block" : "none";
    }
}

// Kısayol tuşlarını bağlama
export function bindShortcuts() {
    let handleShortcuts = null;
    if (handleShortcuts) {
        document.removeEventListener("keydown", handleShortcuts);
    }

    const shortcuts = {
        search: localStorage.getItem("searchShortcut") || "Ctrl + /",
        favorite: localStorage.getItem("favoriteShortcut") || "Ctrl + Shift + F",
        settings: localStorage.getItem("settingsShortcut") || "Ctrl + Shift + X",
        history: localStorage.getItem("historyShortcut") || "Ctrl + Shift + H",
        images: localStorage.getItem("imagesShortcut") || "Ctrl + I",
        shopping: localStorage.getItem("shoppingShortcut") || "Ctrl + S",
        news: localStorage.getItem("newsShortcut") || "Ctrl + N",
        account: localStorage.getItem("accountShortcut") || "Ctrl + Shift + A",
        ai: localStorage.getItem("aiShortcut") || "Ctrl + Shift + I"
    };

handleShortcuts = (e) => {
  // Fix: e.key kontrolü
  if (!e.key || typeof e.key !== "string") {
    console.warn("Geçersiz veya tanımsız e.key değeri:", e);
    return;
  }

  const keyCombo = `${e.ctrlKey ? "Ctrl + " : ""}${e.shiftKey ? "Shift + " : ""}${e.key.toUpperCase()}`;
  if (keyCombo === shortcuts.search) {
    e.preventDefault();
    document.getElementById("searchInput")?.focus();
  } else if (keyCombo === shortcuts.favorite) {
    e.preventDefault();
    const modal = document.getElementById("addFavoriteModal");
    if (modal) {
      modal.style.display = "block";
      document.getElementById("modalName")?.focus();
    }
  } else if (keyCombo === shortcuts.settings) {
    e.preventDefault();
    const p = document.getElementById("menuPanel");
    if (p) {
      p.style.display = p.style.display === "block" ? "none" : "block";
      document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
      document.getElementById("settingsContent")?.classList.add("active");
      document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
      document.querySelector(".tab-button[data-tab='settings']")?.classList.add("active");
    }
  } else if (keyCombo === shortcuts.history) {
    e.preventDefault();
    const p = document.getElementById("menuPanel");
    if (p) {
      p.style.display = p.style.display === "block" ? "none" : "block";
      document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
      document.getElementById("historyContent")?.classList.add("active");
      document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
      document.querySelector(".tab-button[data-tab='history']")?.classList.add("active");
      loadSearchHistory();
    }
  } else if (keyCombo === shortcuts.images && document.getElementById("searchInput")?.value.trim()) {
    e.preventDefault();
    search("images");
  } else if (keyCombo === shortcuts.shopping && document.getElementById("searchInput")?.value.trim()) {
    e.preventDefault();
    search("shopping");
  } else if (keyCombo === shortcuts.news && document.getElementById("searchInput")?.value.trim()) {
    e.preventDefault();
    search("news");
  } else if (keyCombo === shortcuts.ai && document.getElementById("searchInput")?.value.trim()) {
    e.preventDefault();
    search("ai");
  }
};

    document.addEventListener("keydown", handleShortcuts);
}

// Arka plan resmi önbellekleme
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

// YouTube video ID çıkarma
export function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Arka plan yükleme
export async function loadCachedBackground(url) {
    const videoElement = document.getElementById('backgroundVideo');
    const youTubeElement = document.getElementById('backgroundYouTube');
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

    if (isYouTube) {
        if (videoElement) {
            videoElement.style.display = 'none';
            if (videoElement.pause) videoElement.pause();
            const source = videoElement.querySelector('source');
            if (source) source.src = '';
            if (videoElement.load) videoElement.load();
        }

        const cached = localStorage.getItem(`bgCache_${url}`);
        const videoId = extractYouTubeId(cached || url);
        if (videoId && youTubeElement) {
            youTubeElement.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&playsinline=1&rel=0&iv_load_policy=3&vq=hd720&enablejsapi=1`;
            youTubeElement.style.display = 'block';
            document.body.style.backgroundImage = 'none';
            const aspectRatio = window.innerWidth / window.innerHeight;
            youTubeElement.style.transform = aspectRatio < 1.6 ? 'scale(1.15)' : 'scale(1.1)';
            cacheBackgroundImage(url);

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
            if (youTubeElement) {
                youTubeElement.style.display = 'none';
                youTubeElement.src = '';
            }
            document.body.style.backgroundImage = 'none';
        }
    } else if (isVideo || isImage) {
        if (youTubeElement) {
            youTubeElement.style.display = 'none';
            youTubeElement.src = '';
        }

        let cached = localStorage.getItem(`bgCache_${url}`);
        if (!cached) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch");
                const blob = await response.blob();
                cached = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                localStorage.setItem(`bgCache_${url}`, cached);
            } catch (e) {
                console.error("Arka plan yükleme hatası:", e);
                return;
            }
        }

        if (isVideo && videoElement) {
            const source = videoElement.querySelector('source');
            if (source) source.src = cached;
            videoElement.style.display = 'block';
            videoElement.load();
            if (videoElement.play) videoElement.play();
            document.body.style.backgroundImage = 'none';
        } else {
            if (videoElement) {
                videoElement.style.display = 'none';
                if (videoElement.pause) videoElement.pause();
                const source = videoElement.querySelector('source');
                if (source) source.src = '';
                if (videoElement.load) videoElement.load();
            }
            document.body.style.backgroundImage = `url('${cached}')`;
        }
    } else {
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

    window.addEventListener('resize', () => {
        if (isYouTube && youTubeElement?.style.display === 'block') {
            const aspectRatio = window.innerWidth / window.innerHeight;
            youTubeElement.style.transform = aspectRatio < 1.6 ? 'scale(1.15)' : 'scale(1.1)';
        }
    }, { once: true });
}

// Varsayılan ayarlar
const defaultSettings = {
    bgUrl: "",
    font: "'Open Sans', sans-serif",
    theme: "dark",
    systemTheme: "vanilla",
    accentColor: "#6F958D",
    language: "tr",
    searchEngine: "google",
    showFavorites: "true",
    showSuggestions: "true",
    showWeather: "true",
    showInfoBar: "true",
    showSearch: "true",
    showSearchShortcuts: "true",
    showAISearch: "true",
    showAccountButton: "true",
    showAccountInfoText: "true",
    logoDisplay: "logo-name",
    logoPosition: "center",
    logoNameColor: "lightFont",
    maxFavorites: "5",
    searchShortcut: "Ctrl + /",
    favoriteShortcut: "Ctrl + Shift + F",
    settingsShortcut: "Ctrl + Shift + X",
    historyShortcut: "Ctrl + Shift + H",
    imagesShortcut: "Ctrl + I",
    shoppingShortcut: "Ctrl + S",
    newsShortcut: "Ctrl + N",
    accountShortcut: "Ctrl + Shift + A",
    aiShortcut: "Ctrl + Shift + I",
    weatherLocation: "",
    weatherUpdateInterval: "5",
    linkBehavior: "newTab",
    aiProvider: "chatgpt",
    customAiUrl: "",
    weatherAPI: "wttrin",
    openWeatherMapApiKey: "",
    weatherApiKey: "",
    visualCrossingApiKey: ""
};

// Ayarları al ve varsayılanlarla birleştir
function getSetting(key, elementId) {
    const element = document.getElementById(elementId);
    return element?.value.trim() || localStorage.getItem(key) || defaultSettings[key] || "";
}

// Ayarları uygulama
export function applySettings(loadCachedBackground, updateLanguage, loadFavorites, updateSearchEnginePreview, fetchWeather, bindShortcuts, startWeatherUpdate) {
    // 1. Ayarları al
    const settings = {
        bgUrl: getSetting("bgUrl", "bgUrlInput"),
        font: getSetting("font", "fontSelect"),
        theme: getSetting("theme", "themeSelect"),
        systemTheme: getSetting("systemTheme", "systemThemeSelect"),
        accentColor: getSetting("accentColor", "accentColor"),
        language: getSetting("language", "languageSelect"),
        searchEngine: getSetting("searchEngine", "searchEngineSelect"),
        showFavorites: getSetting("showFavorites", "showFavorites"),
        showSuggestions: getSetting("showSuggestions", "showSuggestions"),
        showWeather: getSetting("showWeather", "showWeather"),
        showInfoBar: getSetting("showInfoBar", "showInfoBar"),
        showSearch: getSetting("showSearch", "showSearch"),
        showSearchShortcuts: getSetting("showSearchShortcuts", "showSearchShortcuts"),
        showAISearch: getSetting("showAISearch", "showAISearch"),
        showAccountButton: getSetting("showAccountButton", "showAccountButton"),
        showAccountInfoText: getSetting("showAccountInfoText", "showAccountInfoText"),
        logoDisplay: getSetting("logoDisplay", "logoDisplaySelect"),
        logoPosition: getSetting("logoPosition", "logoPositionSelect"),
        logoNameColor: getSetting("logoNameColor", "logoNameColorSelect"),
        maxFavorites: getSetting("maxFavorites", "maxFavorites"),
        searchShortcut: getSetting("searchShortcut", "searchShortcutInput"),
        favoriteShortcut: getSetting("favoriteShortcut", "favoriteShortcutInput"),
        settingsShortcut: getSetting("settingsShortcut", "settingsShortcutInput"),
        historyShortcut: getSetting("historyShortcut", "historyShortcutInput"),
        imagesShortcut: getSetting("imagesShortcut", "imagesShortcutInput"),
        shoppingShortcut: getSetting("shoppingShortcut", "shoppingShortcutInput"),
        newsShortcut: getSetting("newsShortcut", "newsShortcutInput"),
        accountShortcut: getSetting("accountShortcut", "accountShortcutInput"),
        aiShortcut: getSetting("aiShortcut", "aiShortcutInput"),
        weatherLocation: getSetting("weatherLocation", "weatherLocation"),
        weatherUpdateInterval: getSetting("weatherUpdateInterval", "weatherUpdateInterval"),
        linkBehavior: getSetting("linkBehavior", "linkBehavior"),
        aiProvider: getSetting("aiProvider", "aiProviderSelect"),
        customAiUrl: getSetting("customAiUrl", "customAiUrl"),
        weatherAPI: getSetting("weatherAPI", "weatherAPI"),
        openWeatherMapApiKey: getSetting("openWeatherMapApiKey", "openWeatherMapApiKey"),
        weatherApiKey: getSetting("weatherApiKey", "weatherApiKey"),
        visualCrossingApiKey: getSetting("visualCrossingApiKey", "visualCrossingApiKey")
    };

    // 2. localStorage'a kaydet
    Object.entries(settings).forEach(([key, value]) => localStorage.setItem(key, value));

    // 3. Ayarları uygula
    loadCachedBackground(settings.bgUrl);
    document.documentElement.style.setProperty('--site-font', settings.font);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(settings.theme);

    // Tema dosyasını yükle
    const themeStylesheet = document.getElementById("themeStylesheet");
    if (themeStylesheet) {
        themeStylesheet.href = `./styles/${settings.systemTheme}.css`;
    } else {
        console.warn("themeStylesheet bulunamadı!");
    }

    // systemThemeSelect değerini güncelle
    const systemThemeSelect = document.getElementById("systemThemeSelect");
    if (systemThemeSelect) {
        systemThemeSelect.value = settings.systemTheme;
    }

    // İkonları güncelle
    const logoImg = document.getElementById("logoImg");
    const logoName = document.getElementById("logoName");
    const multiSearchIcon = document.getElementById("multiSearchIcon");
    const voiceIcon = document.getElementById("voiceIcon");
    const accountIcon = document.getElementById("accountIcon");
    const menuIcon = document.getElementById("menuIcon");

    if (logoImg) {
        logoImg.src = settings.theme === "light" ? "ico/logo-dark.png" : "ico/logo.png";
    }
    if (multiSearchIcon) {
        multiSearchIcon.src = settings.theme === "light" ? "ico/multisearch.png" : "ico/multisearch.png";
    }
    if (voiceIcon) {
        voiceIcon.src = settings.theme === "light" ? "ico/mic-dark.png" : "ico/mic.png";
    }
    if (menuIcon) {
        menuIcon.src = settings.theme === "light" ? "ico/menu-dark.png" : "ico/menu.png";
    }
    if (accountIcon) {
        accountIcon.src = settings.theme === "light" ? "ico/account-dark.png" : "ico/account.png";
    }

    // Görünürlük ayarları
    const elements = {
        searchBar: settings.showSearch === "true" ? "flex" : "none",
        buttons: settings.showSearchShortcuts === "true" ? "flex" : "none",
        favorites: settings.showFavorites === "true" ? "flex" : "none",
        infoBar: settings.showInfoBar === "true" ? "block" : "none",
        weatherWidget: settings.showWeather === "true" ? "block" : "none",
        accountButton: settings.showAccountButton === "true" ? "block" : "none",
        accountInfo: settings.showAccountInfoText === "true" && localStorage.getItem("accountUsername") ? "inline" : "none",
        searchAIBtn: settings.showAISearch === "true" ? "inline-block" : "none"
    };

    Object.entries(elements).forEach(([id, display]) => {
        const element = document.getElementById(id);
        if (element) element.style.display = display;
    });

    // Logo ayarları
    if (logoImg && logoName) {
        if (settings.logoDisplay === "logo") {
            logoImg.style.display = "block";
            logoName.style.display = "none";
        } else if (settings.logoDisplay === "logo-name") {
            logoImg.style.display = "block";
            logoName.style.display = "inline";
        } else {
            logoImg.style.display = "none";
            logoName.style.display = "none";
        }
    }

    const logoContainer = document.getElementById("logo")?.parentElement;
    if (logoContainer) {
        logoContainer.style.justifyContent = settings.logoPosition === "left" ? "flex-start" : settings.logoPosition === "right" ? "flex-end" : "center";
    }

    if (logoName) {
        logoName.classList.remove("lightFont", "darkFont");
        logoName.classList.add(settings.logoNameColor);
    }

    // Hava durumu
    const weatherWidget = document.getElementById("weatherWidget");
    if (settings.showWeather === "true" && settings.weatherLocation) {
        fetchWeather();
        startWeatherUpdate();
    } else if (weatherWidget) {
        weatherWidget.innerHTML = `<span class="weather-error">${translations[settings.language]?.weatherError || "Hava durumu alınamadı"}</span>`;
    }

    // Son kullanılan arka planları güncelle
    let recentBgs = JSON.parse(localStorage.getItem("recentBackgrounds") || "[]");
    recentBgs = recentBgs.filter(url => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    });
    if (settings.bgUrl && !recentBgs.includes(settings.bgUrl)) {
        recentBgs.unshift(settings.bgUrl);
        if (recentBgs.length > 5) recentBgs.pop();
        localStorage.setItem("recentBackgrounds", JSON.stringify(recentBgs));
    }

    // Diğer işlemleri gerçekleştir
    updateLanguage(settings.language);
    loadFavorites();
    updateSearchEnginePreview();
    bindShortcuts();
}

// Hava durumu alma
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

    try {
        if (!location || location.trim() === "") {
            if (widget) {
                widget.innerHTML = `<span class="weather-error">${translations[lang]?.noLocation || "Lütfen bir konum girin"}</span>`;
            }
            return;
        }

        if (widget) widget.textContent = translations[lang]?.loading || "Yükleniyor...";

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
                    0: translations[lang]?.weatherClear || "☀️",
                    1: translations[lang]?.weatherPartlyCloudy || "🌤️",
                    2: translations[lang]?.weatherCloudy || "☁️",
                    3: translations[lang]?.weatherVeryCloudy || "🌥️",
                    45: translations[lang]?.weatherFog || "🌫️",
                    61: translations[lang]?.weatherLightRain || "🌦️",
                    63: translations[lang]?.weatherRain || "🌧️",
                    80: translations[lang]?.weatherShowers || "🌩️"
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
        if (widget) {
            widget.textContent = text;
            widget.title = text;
        }
    } catch (error) {
        if (widget) {
            widget.innerHTML = `<span class="weather-error">${translations[lang]?.weatherError || "Hava durumu alınamadı"}: ${error.message}</span>`;
        }
    } finally {
        isFetchingWeather = false;
    }
}

// Hava durumu güncelleme
export function startWeatherUpdate() {
    const interval = parseInt(localStorage.getItem("weatherUpdateInterval") || "10") * 60 * 1000;
    if (interval === 0) return;
    fetchWeather();
    setInterval(fetchWeather, interval);
}

// Tarayıcıyı sıfırlama
export function resetBrowser() {
    const lang = localStorage.getItem("language") || "tr";
    if (!confirm(translations[lang]?.resetConfirm || "Tüm ayarları ve verileri sıfırlamak istediğinize emin misiniz?")) return;

    localStorage.clear();

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

    alert(translations[lang]?.resetSuccess || "Tarayıcı başarıyla sıfırlandı!");
    window.location.reload();
}
// İçe/dışa aktarma modali
export function openImportExportModal() {
    const modal = document.getElementById("importExportModal");
    if (modal) modal.style.display = "block";
}

export function closeImportExportModal() {
    const modal = document.getElementById("importExportModal");
    if (modal) modal.style.display = "none";
}

// Ayarları dışa aktarma
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

// Ayarları içe aktarma
export function importSettings(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const settings = JSON.parse(evt.target.result);
            for (let key in settings) {
                localStorage.setItem(key, settings[key]);
            }
            applySettings(loadCachedBackground, updateLanguage, loadFavorites, updateSearchEnginePreview, fetchWeather, bindShortcuts, startWeatherUpdate);
            alert(translations[localStorage.getItem("language") || "tr"]?.importSuccess || "Ayarlar başarıyla yüklendi!");
            window.location.reload();
        } catch (err) {
            alert(translations[localStorage.getItem("language") || "tr"]?.invalidFile || "Geçersiz dosya: " + err.message);
        }
        closeImportExportModal();
    };
    reader.readAsText(file);
}

// Ayarları kaydetme
export function saveSettings() {
    const theme = getSetting("theme", "themeSelect");
    const systemTheme = getSetting("systemTheme", "systemThemeSelect");
    localStorage.setItem("theme", theme);
    localStorage.setItem("systemTheme", systemTheme);

    const themeStylesheet = document.getElementById("themeStylesheet");
    if (themeStylesheet) {
        themeStylesheet.href = `./styles/${systemTheme}.css`;
    } else {
        console.warn("themeStylesheet bulunamadı!");
    }

    applySettings(loadCachedBackground, updateLanguage, loadFavorites, updateSearchEnginePreview, fetchWeather, bindShortcuts, startWeatherUpdate);
}

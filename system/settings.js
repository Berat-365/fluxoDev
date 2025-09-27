// Fixed and cleaned Fluxo script (refactored for robustness)

// --- Utilities ---
export function selectColor(color) {
    console.log("Seçilen renk:", color);
    const accentInput = document.getElementById("accentColor");
    if (accentInput) accentInput.value = color;
    document.documentElement.style.setProperty('--accent-color', color);
    try { localStorage.setItem("accentColor", color); } catch (e) { console.warn("localStorage yazılamadı:", e); }
}

export function rgbToHex(rgb) {
    if (!rgb) return '#000000';
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';
    const r = parseInt(result[0], 10);
    const g = parseInt(result[1], 10);
    const b = parseInt(result[2], 10);
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    return `#${hex}`;
}

// --- Search engine preview ---
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
    if (!preview) return;
    preview.src = logos[engine] || "";
    preview.style.display = logos[engine] ? "block" : "none";
}

// --- Keyboard shortcuts ---
function _normalizeShortcut(s) {
    if (!s || typeof s !== 'string') return '';
    return s.replace(/\s*\+\s*/g, ' + ').trim().toUpperCase();
}

export function bindShortcuts() {
    // Remove previously bound handler if exists
    if (document._fluxHandleShortcuts) {
        document.removeEventListener('keydown', document._fluxHandleShortcuts);
        document._fluxHandleShortcuts = null;
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

    // Normalize stored shortcuts
    Object.keys(shortcuts).forEach(k => { shortcuts[k] = _normalizeShortcut(shortcuts[k]); });

    const handleShortcuts = (e) => {
        if (!e || !e.key || typeof e.key !== 'string') return;

        const parts = [];
        if (e.ctrlKey) parts.push('CTRL');
        if (e.shiftKey) parts.push('SHIFT');
        if (e.altKey) parts.push('ALT');
        // Use standardized key name (make single-char keys uppercase)
        let keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key.replace(/^Arrow/, '').toUpperCase();
        parts.push(keyName);
        const keyCombo = parts.join(' + ');

        try {
            if (keyCombo === shortcuts.search) {
                e.preventDefault();
                document.getElementById("searchInput")?.focus();
            } else if (keyCombo === shortcuts.favorite) {
                e.preventDefault();
                const modal = document.getElementById("addFavoriteModal");
                if (modal) { modal.style.display = "block"; document.getElementById("modalName")?.focus(); }
            } else if (keyCombo === shortcuts.settings) {
                e.preventDefault();
                const p = document.getElementById("menuPanel");
                if (p) {
                    p.style.display = p.style.display === "block" ? "none" : "block";
                    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
                    document.getElementById("settingsContent")?.classList.add("active");
                    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
                    document.querySelector(".tab-button[data-tab='settings']")?.classList.add("active");
                }
            } else if (keyCombo === shortcuts.history) {
                e.preventDefault();
                const p = document.getElementById("menuPanel");
                if (p) {
                    p.style.display = p.style.display === "block" ? "none" : "block";
                    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
                    document.getElementById("historyContent")?.classList.add("active");
                    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
                    document.querySelector(".tab-button[data-tab='history']")?.classList.add("active");
                    if (typeof loadSearchHistory === 'function') loadSearchHistory();
                }
            } else if (keyCombo === shortcuts.images && document.getElementById("searchInput")?.value.trim()) {
                e.preventDefault(); if (typeof search === 'function') search("images");
            } else if (keyCombo === shortcuts.shopping && document.getElementById("searchInput")?.value.trim()) {
                e.preventDefault(); if (typeof search === 'function') search("shopping");
            } else if (keyCombo === shortcuts.news && document.getElementById("searchInput")?.value.trim()) {
                e.preventDefault(); if (typeof search === 'function') search("news");
            } else if (keyCombo === shortcuts.ai && document.getElementById("searchInput")?.value.trim()) {
                e.preventDefault(); if (typeof search === 'function') search("ai");
            }
        } catch (err) {
            console.error('bindShortcuts handler error:', err);
        }
    };

    document._fluxHandleShortcuts = handleShortcuts;
    document.addEventListener('keydown', handleShortcuts);
}

// --- Background caching & loading ---
export async function cacheBackgroundImage(url) {
    if (!url) return;
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    try {
        if (isYouTube) {
            // store original URL for YouTube videos
            localStorage.setItem(`bgCache_${url}`, url);
            return;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch background image");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            try { localStorage.setItem(`bgCache_${url}`, reader.result); } catch (e) { console.warn('localStorage dolu veya erişim hatası', e); }
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        console.error("Arka plan önbellekleme hatası:", e);
    }
}

export function extractYouTubeId(url) {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export async function loadCachedBackground(url) {
    const videoElement = document.getElementById('backgroundVideo');
    const youTubeElement = document.getElementById('backgroundYouTube');
    if (!url) {
        // clear
        if (videoElement) { videoElement.style.display = 'none'; videoElement.pause?.(); }
        if (youTubeElement) { youTubeElement.style.display = 'none'; youTubeElement.src = ''; }
        document.body.style.backgroundImage = 'none';
        return;
    }

    const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    const isImage = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);

    if (isYouTube) {
        if (videoElement) { videoElement.style.display = 'none'; videoElement.pause?.(); videoElement.querySelector('source')?.setAttribute('src', ''); videoElement.load?.(); }
        const cached = localStorage.getItem(`bgCache_${url}`) || url;
        const videoId = extractYouTubeId(url);
        if (videoId && youTubeElement) {
            youTubeElement.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&playsinline=1&rel=0&iv_load_policy=3&vq=hd720&enablejsapi=1`;
            youTubeElement.style.display = 'block';
            document.body.style.backgroundImage = 'none';
            cacheBackgroundImage(url);
        } else {
            console.error("Geçersiz YouTube URL'si:", url);
            alert("Geçersiz YouTube URL'si. Lütfen geçerli bir video bağlantısı girin.");
            if (youTubeElement) { youTubeElement.style.display = 'none'; youTubeElement.src = ''; }
            document.body.style.backgroundImage = 'none';
        }
        // keep resize listener for responsive transforms
        window.addEventListener('resize', () => {
            if (youTubeElement?.style.display === 'block') {
                const aspectRatio = window.innerWidth / window.innerHeight;
                youTubeElement.style.transform = aspectRatio < 1.6 ? 'scale(1.15)' : 'scale(1.1)';
            }
        });
        return;
    }

    // Image or video file (try cached first)
    try {
        let cached = localStorage.getItem(`bgCache_${url}`);
        if (!cached) {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch background');
            const blob = await response.blob();
            cached = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
            try { localStorage.setItem(`bgCache_${url}`, cached); } catch (e) { console.warn('localStorage write failed', e); }
        }

        if (isVideo && videoElement) {
            const source = videoElement.querySelector('source');
            if (source) source.src = cached;
            videoElement.style.display = 'block';
            videoElement.load?.();
            videoElement.play?.();
            document.body.style.backgroundImage = 'none';
        } else {
            if (videoElement) {
                videoElement.style.display = 'none';
                videoElement.pause?.();
                videoElement.querySelector('source')?.setAttribute('src', '');
                videoElement.load?.();
            }
            document.body.style.backgroundImage = `url('${cached}')`;
        }
    } catch (e) {
        console.error('Arka plan yükleme hatası:', e);
    }
}

// --- Settings defaults and helpers ---
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
    weatherUpdateInterval: "manual",
    linkBehavior: "newTab",
    aiProvider: "chatgpt",
    customAiUrl: "",
    weatherAPI: "wttrin",
    openWeatherMapApiKey: "",
    weatherApiKey: "",
    visualCrossingApiKey: ""
};

function getSetting(key, elementId) {
    const element = document.getElementById(elementId);
    const elVal = element?.value?.trim?.();
    if (elVal) return elVal;
    try { return localStorage.getItem(key) ?? defaultSettings[key] ?? ""; } catch (e) { return defaultSettings[key] ?? ""; }
}

// --- Apply settings (safe, idempotent) ---
export function applySettings(loadCachedBackground, updateLanguage, loadFavorites, updateSearchEnginePreview, fetchWeather, bindShortcuts, startWeatherUpdate) {
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

    // save to localStorage (best effort)
    Object.entries(settings).forEach(([key, value]) => {
        try {
            if (value !== undefined && value !== null) {
                // Ensure userFavorites is saved as favorites
                if (key === 'favorites' && localStorage.getItem('userFavorites')) {
                    localStorage.setItem('favorites', localStorage.getItem('userFavorites'));
                }
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn(`localStorage set failed for ${key}`, e);
        }
    });

    // apply visuals
    if (typeof loadCachedBackground === 'function') loadCachedBackground(settings.bgUrl);
    document.documentElement.style.setProperty('--site-font', settings.font || defaultSettings.font);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor || defaultSettings.accentColor);

    document.body.classList.remove('light', 'dark');
    if (settings.theme) document.body.classList.add(settings.theme);

    const themeStylesheet = document.getElementById('themeStylesheet');
    if (themeStylesheet) themeStylesheet.href = `./styles/${settings.systemTheme || defaultSettings.systemTheme}.css`;

    const systemThemeSelect = document.getElementById('systemThemeSelect');
    if (systemThemeSelect) systemThemeSelect.value = settings.systemTheme || defaultSettings.systemTheme;

        // Validate and apply accentColor
    const validAccentColor = /^#[0-9A-Fa-f]{6}$/.test(settings.accentColor) ? settings.accentColor : defaultSettings.accentColor;
    document.documentElement.style.setProperty('--accent-color', validAccentColor);
    console.log(`Applying accentColor: ${validAccentColor}`);

    // icons and logo
    const logoImg = document.getElementById('logoImg');
    const logoName = document.getElementById('logoName');
    const multiSearchIcon = document.getElementById('multiSearchIcon');
    const voiceIcon = document.getElementById('voiceIcon');
    const accountIcon = document.getElementById('accountIcon');
    const menuIcon = document.getElementById('menuIcon');

    if (logoImg) logoImg.src = settings.theme === 'light' ? 'ico/logo-dark.png' : 'ico/logo.png';
    if (multiSearchIcon) multiSearchIcon.src = 'ico/multisearch.png';
    if (voiceIcon) voiceIcon.src = settings.theme === 'light' ? 'ico/mic-dark.png' : 'ico/mic.png';
    if (menuIcon) menuIcon.src = settings.theme === 'light' ? 'ico/menu-dark.png' : 'ico/menu.png';
    if (accountIcon) accountIcon.src = settings.theme === 'light' ? 'ico/account-dark.png' : 'ico/account.png';

    // visibility
    const elements = {
        searchBar: settings.showSearch === 'true' ? 'flex' : 'none',
        buttons: settings.showSearchShortcuts === 'true' ? 'flex' : 'none',
        favorites: settings.showFavorites === 'true' ? 'flex' : 'none',
        infoBar: settings.showInfoBar === 'true' ? 'block' : 'none',
        weatherWidget: settings.showWeather === 'true' ? 'block' : 'none',
        accountButton: settings.showAccountButton === 'true' ? 'block' : 'none',
        accountInfo: (settings.showAccountInfoText === 'true' && localStorage.getItem('accountUsername')) ? 'inline' : 'none',
        searchAIBtn: settings.showAISearch === 'true' ? 'inline-block' : 'none'
    };
    Object.entries(elements).forEach(([id, display]) => { const el = document.getElementById(id); if (el) el.style.display = display; });

    // logo display
    if (logoImg && logoName) {
        if (settings.logoDisplay === 'logo') { logoImg.style.display = 'block'; logoName.style.display = 'none'; }
        else if (settings.logoDisplay === 'logo-name') { logoImg.style.display = 'block'; logoName.style.display = 'inline'; }
        else { logoImg.style.display = 'none'; logoName.style.display = 'none'; }
    }

    const logoContainer = document.getElementById('logo')?.parentElement;
    if (logoContainer) logoContainer.style.justifyContent = settings.logoPosition === 'left' ? 'flex-start' : settings.logoPosition === 'right' ? 'flex-end' : 'center';

    if (logoName) { logoName.classList.remove('lightFont', 'darkFont'); logoName.classList.add(settings.logoNameColor || defaultSettings.logoNameColor); }

    // weather
    const lang = settings.language || defaultSettings.language;
    const weatherWidget = document.getElementById('weatherWidget');
    if (settings.showWeather === 'true' && settings.weatherLocation) {
        if (typeof fetchWeather === 'function') fetchWeather();
        if (typeof startWeatherUpdate === 'function') startWeatherUpdate();
    } else if (weatherWidget) {
        const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
        weatherWidget.innerHTML = `<span class="weather-error">${t.weatherError || "Hava durumu alınamadı"}</span>`;
    }

    // recent backgrounds
    try {
        let recentBgs = JSON.parse(localStorage.getItem('recentBackgrounds') || '[]');
        recentBgs = (Array.isArray(recentBgs) ? recentBgs : []).filter(url => {
            try { new URL(url); return true; } catch { return false; }
        });
        if (settings.bgUrl && !recentBgs.includes(settings.bgUrl)) { recentBgs.unshift(settings.bgUrl); if (recentBgs.length > 5) recentBgs.pop(); localStorage.setItem('recentBackgrounds', JSON.stringify(recentBgs)); }
    } catch (e) { /* ignore */ }

    // other callbacks
    if (typeof updateLanguage === 'function') updateLanguage(settings.language);
    if (typeof loadFavorites === 'function') loadFavorites();
    if (typeof updateSearchEnginePreview === 'function') updateSearchEnginePreview();
    if (typeof bindShortcuts === 'function') bindShortcuts();
}

// --- Weather fetching ---
let isFetchingWeather = false;

async function getCoordinates(place) {
    if (!place) throw new Error('Konum belirtilmedi');
    // Use nominatim openstreetmap (client-side)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error('Koordinat alınamadı: ' + resp.status);
    const json = await resp.json();
    if (!json || !json[0]) throw new Error('Konum bulunamadı');
    return { lat: json[0].lat, lon: json[0].lon };
}

export async function fetchWeather() {
    if (isFetchingWeather) return;
    isFetchingWeather = true;
    const widget = document.getElementById('weatherWidget');
    const location = localStorage.getItem('weatherLocation') || '';
    const api = localStorage.getItem('weatherAPI') || 'wttrin';
    const lang = localStorage.getItem('language') || 'tr';
    const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};

    if (widget) widget.textContent = t.loading || '...';

    try {
        if (!location) throw new Error('Weather location is empty');

        let url = '';
        let responseHandler = null;

        if (api === 'weatherapi') {
            const apiKey = localStorage.getItem('weatherApiKey');
            if (!apiKey) throw new Error('WeatherAPI anahtarı eksik. Lütfen ayarlarda girin.');
            url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&lang=${lang}`;
            responseHandler = async (resp) => {
                if (!resp.ok) throw new Error(`HTTP hata ${resp.status}`);
                const data = await resp.json();
                if (data.error) throw new Error(data.error.message || 'API error');
                return `${data.location.name}: ${data.current.condition.text}, ${data.current.temp_c}°C, Rüzgar: ${data.current.wind_kph} km/s`;
            };
        } else if (api === 'wttrin') {
            url = `https://wttr.in/${encodeURIComponent(location)}?format=%l:+%C+%t+%w&lang=${lang}`;
            responseHandler = async (resp) => {
                if (!resp.ok) throw new Error(`HTTP hata ${resp.status}`);
                const text = await resp.text();
                if (!text.trim()) throw new Error('wttr.in boş yanıt döndü');
                return text.replace(/\+/g, ' ').trim();
            };
        } else if (api === 'openmeteo') {
            const coords = await getCoordinates(location);
            url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=auto`;
            responseHandler = async (resp) => {
                if (!resp.ok) throw new Error(`HTTP hata ${resp.status}`);
                const data = await resp.json();
                if (!data || !data.current_weather) throw new Error('open-meteo veri yok');
                const c = data.current_weather;
                return `${location}: ${c.temperature}°C, Rüzgar: ${c.windspeed} km/s, Kod: ${c.weathercode}`;
            };
        } else {
            throw new Error('Desteklenmeyen API: ' + api);
        }

        console.log('Hava durumu isteği:', url);
        const resp = await fetch(url, { headers: { Accept: api === 'wttrin' ? 'text/plain' : 'application/json' } });
        const text = await responseHandler(resp);
        if (widget) { widget.textContent = text; widget.title = text; }
    } catch (error) {
        console.error('Hava durumu alınamadı:', error);
        if (widget) widget.innerHTML = `<span class="weather-error">${t.weatherError || 'Hava durumu alınamadı'}: ${error.message}</span>`;
    } finally {
        isFetchingWeather = false;
    }
}

export function startWeatherUpdate() {
    const intervalMins = parseInt(localStorage.getItem('weatherUpdateInterval') || '10', 10);
    const intervalMs = (isNaN(intervalMins) ? 10 : intervalMins) * 60 * 1000;
    if (window._fluxWeatherInterval) clearInterval(window._fluxWeatherInterval);
    if (intervalMs === 0) return;
    fetchWeather();
    window._fluxWeatherInterval = setInterval(fetchWeather, intervalMs);
}

// --- Reset / Import / Export ---
export function resetBrowser() {
    const lang = localStorage.getItem('language') || 'tr';
    const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
    if (!confirm(t.resetConfirm || "Tüm ayarları ve verileri sıfırlamak istediğinize emin misiniz?")) return;
    try { localStorage.clear(); } catch (e) { console.warn('localStorage clear failed', e); }

    document.body.style.backgroundImage = 'none';
    const videoElement = document.getElementById('backgroundVideo');
    const youTubeElement = document.getElementById('backgroundYouTube');
    if (videoElement) { videoElement.style.display = 'none'; videoElement.pause?.(); videoElement.querySelector('source')?.setAttribute('src', ''); videoElement.load?.(); }
    if (youTubeElement) { youTubeElement.style.display = 'none'; youTubeElement.src = ''; }

    alert(t.resetSuccess || "Tarayıcı başarıyla sıfırlandı!");
    window.location.reload();
}

export function openImportExportModal() {
    const modal = document.getElementById('importExportModal');
    if (modal) modal.style.display = 'block';
}

export function closeImportExportModal() {
    const modal = document.getElementById('importExportModal');
    if (modal) modal.style.display = 'none';
}

export function exportSettings() {
    const settings = {};
    try {
        Object.keys(localStorage).forEach(k => {
            settings[k] = localStorage.getItem(k);
        });
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fluxodev_settings.json';
        a.click();
        URL.revokeObjectURL(url);
        closeImportExportModal();
    } catch (e) {
        console.error('Export settings error:', e);
        const lang = localStorage.getItem('language') || 'tr';
        const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
        alert(t.exportError || 'Ayarlar dışa aktarılırken hata oluştu: ' + e.message);
    }
}

export function importSettings(file) {
    if (!file) {
        const lang = localStorage.getItem('language') || 'tr';
        const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
        alert(t.noFile || 'Lütfen bir dosya seçin.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const content = evt.target.result;
            if (!content) throw new Error('Dosya boş.');
            const settings = JSON.parse(content);
            if (!settings || typeof settings !== 'object') throw new Error('Geçersiz JSON formatı.');

            // Clear existing settings
            try { localStorage.clear(); } catch (e) { console.warn('localStorage clear failed', e); }

            // Import settings with validation
            Object.entries(settings).forEach(([k, v]) => {
                try {
                    if (v !== undefined && v !== null) {
                        // Validate JSON-stringified values (e.g., favorites, recentBackgrounds)
                        if (k === 'favorites' || k === 'recentBackgrounds') {
                            JSON.parse(v); // Ensure valid JSON
                        }
                        localStorage.setItem(k, v);
                    }
                } catch (e) {
                    console.warn(`localStorage set failed for ${k}: ${e.message}`);
                }
            });

            // Apply settings immediately
            try {
                applySettings(
                    window.loadCachedBackground,
                    window.updateLanguage,
                    window.loadFavorites,
                    window.updateSearchEnginePreview,
                    window.fetchWeather,
                    window.bindShortcuts,
                    window.startWeatherUpdate
                );
                // Force reload critical UI components
                if (typeof window.loadFavorites === 'function') window.loadFavorites();
                if (typeof window.fetchWeather === 'function' && localStorage.getItem('weatherLocation')) window.fetchWeather();
                if (typeof window.updateSearchEnginePreview === 'function') window.updateSearchEnginePreview();
                if (typeof window.bindShortcuts === 'function') window.bindShortcuts();
                if (typeof window.startWeatherUpdate === 'function' && localStorage.getItem('weatherLocation')) window.startWeatherUpdate();
            } catch (e) {
                console.error('Settings apply error:', e);
            }

            const lang = localStorage.getItem('language') || 'tr';
            const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
            alert(t.importSuccess || 'Ayarlar başarıyla yüklendi!');
            // Delay reload to ensure UI updates
            setTimeout(() => window.location.reload(), 100);
        } catch (err) {
            console.error('Import settings error:', err);
            const lang = localStorage.getItem('language') || 'tr';
            const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
            alert(t.invalidFile || 'Geçersiz dosya: ' + err.message);
        }
        closeImportExportModal();
    };
    reader.onerror = () => {
        const lang = localStorage.getItem('language') || 'tr';
        const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
        alert(t.fileReadError || 'Dosya okunamadı.');
        closeImportExportModal();
    };
    reader.readAsText(file);
}

// Auto-apply settings on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        applySettings(
            window.loadCachedBackground,
            window.updateLanguage,
            window.loadFavorites,
            window.updateSearchEnginePreview,
            window.fetchWeather,
            window.bindShortcuts,
            window.startWeatherUpdate
        );
    } catch (e) {
        console.error('Auto-apply settings error:', e);
    }
});

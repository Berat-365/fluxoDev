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
  showScienceSearch: "true",
  showAccountButton: "true",
  showAccountInfoText: "true",
  logoDisplay: "logo-name",
  logoPosition: "center",
  logoColor: "colored",
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
  multiSearchEnabled: "false",
  aiProvider: "chatgpt",
  customAiUrl: "",
  weatherAPI: "wttr.in",
  openWeatherMapApiKey: "",
  weatherApiKey: "",
  visualCrossingApiKey: "",
  safeSearchOptions: "safeSearchEnable",
  disableSearchHistoryLog: "disableSearchHistoryLogDisable",
  privateMode: "privateModeDisable"
};

// Güvenli localStorage erişimi
function safeGetItem(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSetItem(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (e) { console.warn(`localStorage.setItem failed for ${key}:`, e); return false; }
}
function safeRemoveItem(key) {
  try { localStorage.removeItem(key); return true; } catch (e) { return false; }
}

// localStorage kullanılabilir mi?
export function checkStorageAvailability() {
  try {
    const testKey = '__fluxo_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage kullanılamıyor:', e);
    let lang = 'tr';
    try { lang = safeGetItem('language') || 'tr'; } catch {}
    const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
    try { alert(t.storageError || 'Depolama alanı dolu veya erişilemiyor. Lütfen tarayıcı ayarlarınızı kontrol edin.'); } catch {}
    return false;
  }
}

// Basit DOM cache
const DOM = {};
function $(id) {
  if (!DOM[id]) DOM[id] = document.getElementById(id);
  return DOM[id];
}

// ------------------------- Color & UI helpers -------------------------
export function selectColor(color) {
  if (!color) return;
  const accentInput = $('accentColor');
  if (accentInput) accentInput.value = color;
  document.documentElement.style.setProperty('--accent-color', color);
  safeSetItem('accentColor', color);
}

export function rgbToHex(rgb) {
  if (!rgb) return '#000000';
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return '#000000';
  const [r, g, b] = result.map(n => parseInt(n, 10));
  const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  return `#${hex}`;
}

export function updateSearchEnginePreview() {
  const engine = $('searchEngineSelect')?.value || safeGetItem('searchEngine') || defaultSettings.searchEngine;
  const preview = $('engineLogo');
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

// ------------------------- Shortcuts -------------------------
function _normalizeShortcut(s) {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/\s*\+\s*/g, ' + ').trim().toLocaleUpperCase('en-US');
}

export function bindShortcuts() {
  if (document._fluxHandleShortcuts) {
    document.removeEventListener('keydown', document._fluxHandleShortcuts);
    document._fluxHandleShortcuts = null;
  }

  const shortcuts = {
    search: safeGetItem("searchShortcut") || defaultSettings.searchShortcut,
    favorite: safeGetItem("favoriteShortcut") || defaultSettings.favoriteShortcut,
    settings: safeGetItem("settingsShortcut") || defaultSettings.settingsShortcut,
    history: safeGetItem("historyShortcut") || defaultSettings.historyShortcut,
    images: safeGetItem("imagesShortcut") || defaultSettings.imagesShortcut,
    shopping: safeGetItem("shoppingShortcut") || defaultSettings.shoppingShortcut,
    news: safeGetItem("newsShortcut") || defaultSettings.newsShortcut,
    account: safeGetItem("accountShortcut") || defaultSettings.accountShortcut,
    ai: safeGetItem("aiShortcut") || defaultSettings.aiShortcut
  };

  Object.keys(shortcuts).forEach(k => { shortcuts[k] = _normalizeShortcut(shortcuts[k]); });

  const handleShortcuts = (e) => {
    if (!e || !e.key) return;
    const parts = [];
    if (e.ctrlKey) parts.push('CTRL');
    if (e.shiftKey) parts.push('SHIFT');
    if (e.altKey) parts.push('ALT');

    let keyName = e.key.length === 1 ? e.key.toLocaleUpperCase('en-US') : e.key.replace(/^Arrow/, '').toLocaleUpperCase('en-US');
    parts.push(keyName);
    const keyCombo = parts.join(' + ');

    try {
      if (keyCombo === shortcuts.search) {
        e.preventDefault();
        $('searchInput')?.focus();
      } else if (keyCombo === shortcuts.favorite) {
        e.preventDefault();
        const modal = $('addFavoriteModal');
        if (modal) { modal.style.display = "block"; $('modalName')?.focus(); }
      } else if (keyCombo === shortcuts.settings) {
        e.preventDefault();
        const p = $('menuPanel');
        if (p) {
          p.style.display = p.style.display === "block" ? "none" : "block";
          document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
          $('settingsContent')?.classList.add("active");
          document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
          document.querySelector(".tab-button[data-tab='settings']")?.classList.add("active");
        }
      } else if (keyCombo === shortcuts.history) {
        e.preventDefault();
        const p = $('menuPanel');
        if (p) {
          p.style.display = p.style.display === "block" ? "none" : "block";
          document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
          $('historyContent')?.classList.add("active");
          document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
          document.querySelector(".tab-button[data-tab='history']")?.classList.add("active");
          if (typeof window.loadSearchHistory === 'function') window.loadSearchHistory();
        }
      } else if (keyCombo === shortcuts.images && $('searchInput')?.value.trim()) {
        e.preventDefault();
        if (typeof window.search === 'function') window.search("images");
      } else if (keyCombo === shortcuts.shopping && $('searchInput')?.value.trim()) {
        e.preventDefault();
        if (typeof window.search === 'function') window.search("shopping");
      } else if (keyCombo === shortcuts.news && $('searchInput')?.value.trim()) {
        e.preventDefault();
        if (typeof window.search === 'function') window.search("news");
      } else if (keyCombo === shortcuts.ai && $('searchInput')?.value.trim()) {
        e.preventDefault();
        if (typeof window.search === 'function') window.search("ai");
      }
    } catch (err) {
      console.error('bindShortcuts handler error:', err);
    }
  };

  document._fluxHandleShortcuts = handleShortcuts;
  document.addEventListener('keydown', handleShortcuts);
}

// ------------------------- IndexedDB wrapper for background caching -------------------------
const IDB_DB = 'fluxo_bg_db';
const IDB_STORE = 'backgrounds';

function openIdb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return resolve(null);
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbPut(key, value) {
  const db = await openIdb();
  if (!db) return false;
  return new Promise((res) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const r = store.put(value, key);
      r.onsuccess = () => { res(true); db.close(); };
      r.onerror = () => { res(false); db.close(); };
    } catch (e) { res(false); }
  });
}

async function idbGet(key) {
  const db = await openIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const r = store.get(key);
      r.onsuccess = () => { resolve(r.result ?? null); db.close(); };
      r.onerror = () => { resolve(null); db.close(); };
    } catch (e) { resolve(null); }
  });
}

// ------------------------- Background caching & loading -------------------------
export async function cacheBackgroundImage(url) {
  if (!url) return;
  try {
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    if (isYouTube) {
      safeSetItem(`bgCache_${url}`, url);
      return;
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('fetch failed ' + resp.status);
    const blob = await resp.blob();

    const saved = await idbPut(`bg_${url}`, blob);
    if (!saved) {
      const reader = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(blob);
      });
      safeSetItem(`bgCache_${url}`, reader);
    }
  } catch (e) {
    console.error('cacheBackgroundImage hata:', e);
  }
}

export function extractYouTubeId(url) {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function loadCachedBackground(url) {
  const videoElement = $('backgroundVideo');
  const youTubeElement = $('backgroundYouTube');

  if (!url) {
    if (videoElement) {
      videoElement.style.display = 'none';
      videoElement.pause?.();
      const source = videoElement.querySelector('source');
      if (source) source.src = '';
      videoElement.load?.();
    }
    if (youTubeElement) {
      youTubeElement.style.display = 'none';
      youTubeElement.src = '';
    }
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '';
    return;
  }

  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  const isYouTube = /youtube\.com|youtu\.be/i.test(url);
  if (isYouTube) {
    if (videoElement) {
      videoElement.style.display = 'none';
      videoElement.pause?.();
      const source = videoElement.querySelector('source');
      if (source) source.src = '';
      videoElement.load?.();
    }
    const videoId = extractYouTubeId(url);
    if (videoId && youTubeElement) {
      youTubeElement.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&iv_load_policy=3&playsinline=1`;
      youTubeElement.style.display = 'block';
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '';
      cacheBackgroundImage(url);
      return;
    } else {
      console.error('Geçersiz YouTube URL:', url);
      try { alert('Geçersiz YouTube URL\'si. Lütfen geçerli bir video bağlantısı girin.'); } catch {}
      if (youTubeElement) {
        youTubeElement.style.display = 'none';
        youTubeElement.src = '';
      }
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '';
      return;
    }
  }

  try {
    const idbVal = await idbGet(`bg_${url}`);
    if (idbVal instanceof Blob) {
      if (isVideo && videoElement) {
        const source = videoElement.querySelector('source');
        const blobUrl = URL.createObjectURL(idbVal);
        if (source) source.src = blobUrl;
        videoElement.style.display = 'block';
        videoElement.load?.();
        videoElement.play?.();
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '';
        return;
      } else {
        const blobUrl = URL.createObjectURL(idbVal);
        if (videoElement) {
          videoElement.style.display = 'none';
          videoElement.pause?.();
          const source = videoElement.querySelector('source');
          if (source) source.src = '';
          videoElement.load?.();
        }
        document.body.style.backgroundImage = `url('${blobUrl}')`;
        document.body.style.backgroundColor = '';
        return;
      }
    }

    let cached = safeGetItem(`bgCache_${url}`);
    if (!cached) {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Failed to fetch background');
      const blob = await resp.blob();
      const saved = await idbPut(`bg_${url}`, blob);
      if (saved) {
        return loadCachedBackground(url);
      }
      cached = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
      safeSetItem(`bgCache_${url}`, cached);
    }

    if (isVideo && videoElement) {
      const source = videoElement.querySelector('source');
      if (source) source.src = cached;
      videoElement.style.display = 'block';
      videoElement.load?.();
      videoElement.play?.();
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '';
    } else {
      if (videoElement) {
        videoElement.style.display = 'none';
        videoElement.pause?.();
        const source = videoElement.querySelector('source');
        if (source) source.src = '';
        videoElement.load?.();
      }
      document.body.style.backgroundImage = `url('${cached}')`;
      document.body.style.backgroundColor = '';
    }
  } catch (e) {
    console.error('Arka plan yükleme hatası:', e);
    if (videoElement) {
      videoElement.style.display = 'none';
      videoElement.pause?.();
      const source = videoElement.querySelector('source');
      if (source) source.src = '';
      videoElement.load?.();
    }
    if ($('backgroundYouTube')) {
      $('backgroundYouTube').style.display = 'none';
      $('backgroundYouTube').src = '';
    }
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '';
  }
}

// ------------------------- Settings persistence & apply/load -------------------------
function getSettingFromInputs(key, inputId) {
  const el = inputId ? $(inputId) : null;
  const elVal = el?.value?.trim?.();
  if (elVal) return elVal;
  const stored = safeGetItem(key);
  if (stored !== null && stored !== undefined) return stored;
  return defaultSettings[key] ?? '';
}

export function saveSettings(settings) {
  if (!checkStorageAvailability()) return false;
  try {
    Object.entries(settings).forEach(([k, v]) => {
      if (v !== undefined && v !== null) safeSetItem(k, String(v));
    });
    return true;
  } catch (e) {
    console.error('saveSettings hata:', e);
    return false;
  }
}

export function saveSettingsFromInputs() {
  if (!checkStorageAvailability()) return false;

  try {
    const settings = {
      bgUrl: getSettingFromInputs('bgUrl', 'bgUrlInput'),
      font: getSettingFromInputs('font', 'fontSelect'),
      theme: getSettingFromInputs('theme', 'themeSelect'),
      systemTheme: getSettingFromInputs('systemTheme', 'systemThemeSelect'),
      accentColor: getSettingFromInputs('accentColor', 'accentColor'),
      language: getSettingFromInputs('language', 'languageSelect'),
      searchEngine: getSettingFromInputs('searchEngine', 'searchEngineSelect'),
      showFavorites: getSettingFromInputs('showFavorites', 'showFavorites'),
      showSuggestions: getSettingFromInputs('showSuggestions', 'showSuggestions'),
      showWeather: getSettingFromInputs('showWeather', 'showWeather'),
      showInfoBar: getSettingFromInputs('showInfoBar', 'showInfoBar'),
      showSearch: getSettingFromInputs('showSearch', 'showSearch'),
      showSearchShortcuts: getSettingFromInputs('showSearchShortcuts', 'showSearchShortcuts'),
      showAISearch: getSettingFromInputs('showAISearch', 'showAISearch'),
      showScienceSearch: getSettingFromInputs('showScienceSearch', 'showScienceSearch'),
      showAccountButton: getSettingFromInputs('showAccountButton', 'showAccountButton'),
      showAccountInfoText: getSettingFromInputs('showAccountInfoText', 'showAccountInfoText'),
      logoDisplay: getSettingFromInputs('logoDisplay', 'logoDisplaySelect'),
      logoPosition: getSettingFromInputs('logoPosition', 'logoPositionSelect'),
      logoColor: getSettingFromInputs('logoColor', 'logoColorSelect'),
      logoNameColor: getSettingFromInputs('logoNameColor', 'logoNameColorSelect'),
      maxFavorites: getSettingFromInputs('maxFavorites', 'maxFavorites'),
      searchShortcut: _normalizeShortcut(getSettingFromInputs('searchShortcut', 'searchShortcutInput')),
      favoriteShortcut: _normalizeShortcut(getSettingFromInputs('favoriteShortcut', 'favoriteShortcutInput')),
      settingsShortcut: _normalizeShortcut(getSettingFromInputs('settingsShortcut', 'settingsShortcutInput')),
      historyShortcut: _normalizeShortcut(getSettingFromInputs('historyShortcut', 'historyShortcutInput')),
      imagesShortcut: _normalizeShortcut(getSettingFromInputs('imagesShortcut', 'imagesShortcutInput')),
      shoppingShortcut: _normalizeShortcut(getSettingFromInputs('shoppingShortcut', 'shoppingShortcutInput')),
      newsShortcut: _normalizeShortcut(getSettingFromInputs('newsShortcut', 'newsShortcutInput')),
      accountShortcut: _normalizeShortcut(getSettingFromInputs('accountShortcut', 'accountShortcutInput')),
      aiShortcut: _normalizeShortcut(getSettingFromInputs('aiShortcut', 'aiShortcutInput')),
      weatherLocation: getSettingFromInputs('weatherLocation', 'weatherLocation'),
      weatherUpdateInterval: getSettingFromInputs('weatherUpdateInterval', 'weatherUpdateInterval'),
      linkBehavior: getSettingFromInputs('linkBehavior', 'linkBehavior'),
      multiSearchEnabled: getSettingFromInputs('multiSearchEnabled', 'multiSearchEnabled'),
      aiProvider: getSettingFromInputs('aiProvider', 'aiProviderSelect'),
      customAiUrl: getSettingFromInputs('customAiUrl', 'customAiUrl'),
      weatherAPI: getSettingFromInputs('weatherAPI', 'weatherAPI'),
      openWeatherMapApiKey: getSettingFromInputs('openWeatherMapApiKey', 'openWeatherMapApiKey'),
      weatherApiKey: getSettingFromInputs('weatherApiKey', 'weatherApiKey'),
      visualCrossingApiKey: getSettingFromInputs('visualCrossingApiKey', 'visualCrossingApiKey'),
      safeSearchOptions: getSettingFromInputs('safeSearchOptions', 'safeSearchOptions'),
      disableSearchHistoryLog: getSettingFromInputs('disableSearchHistoryLog', 'disableSearchHistoryLogOptions'),
      privateMode: getSettingFromInputs('privateMode', 'privateModeOptions')
    };

    // Hava durumu API doğrulama (wttr.in için anahtar gerekmez)
    const apiKeyRequired = ['openweathermap', 'weatherapi', 'visualcrossing'];
    if (apiKeyRequired.includes(settings.weatherAPI) && !settings[`${settings.weatherAPI}ApiKey`]) {
      console.warn(`Hava durumu API'si için anahtar eksik: ${settings.weatherAPI}`);
      alert(`Hava durumu API'si (${settings.weatherAPI}) için anahtar eksik. Varsayılan API (wttr.in) kullanılacak.`);
      settings.weatherAPI = 'wttr.in';
    }

    saveSettings(settings);
    applySettings({
      updateSearchEnginePreview,
      loadCachedBackground,
      updateLanguage: window.updateLanguage,
      loadFavorites: window.loadFavorites,
      fetchWeather: window.fetchWeather,
      bindShortcuts,
      startWeatherUpdate: window.startWeatherUpdate
    });
    return true;
  } catch (e) {
    console.error('saveSettingsFromInputs hata:', e);
    return false;
  }
}

export function applySettings(options = {}) {
  try {
    if (!checkStorageAvailability()) {
      console.warn('Depolama kullanılamıyor, varsayılan ayarlar uygulanacak.');
    }

    const settings = {};
    Object.keys(defaultSettings).forEach(k => {
      const stored = safeGetItem(k);
      settings[k] = stored !== null ? stored : defaultSettings[k];
    });

    // Hava durumu API doğrulama (wttr.in için anahtar gerekmez)
    const apiKeyRequired = ['openweathermap', 'weatherapi', 'visualcrossing'];
    if (apiKeyRequired.includes(settings.weatherAPI) && !settings[`${settings.weatherAPI}ApiKey`]) {
      console.warn(`Hava durumu API'si için anahtar eksik: ${settings.weatherAPI}`);
      alert(`Hava durumu API'si (${settings.weatherAPI}) için anahtar eksik. Varsayılan API (wttr.in) kullanılacak.`);
      settings.weatherAPI = 'wttr.in';
    }

    // Tema ve sistem teması
    const currentTheme = settings.theme || defaultSettings.theme;
    const currentSystemTheme = settings.systemTheme || defaultSettings.systemTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-system-theme', currentSystemTheme);
    document.querySelectorAll('[data-theme-dependent]').forEach(el => {
      el.classList.remove('light', 'dark', 'vanilla', 'box', 'neomorph', 'glassmorph');
      el.classList.add(currentTheme, currentSystemTheme);
    });

    // Font
    document.documentElement.style.fontFamily = settings.font || defaultSettings.font;

    // Vurgu rengi
    selectColor(settings.accentColor || defaultSettings.accentColor);

    // Logo ayarları
    const logoEl = $('logo');
    if (logoEl) {
      logoEl.style.display = settings.logoDisplay === 'none' ? 'none' : 'flex';
      logoEl.style.justifyContent = settings.logoPosition || defaultSettings.logoPosition;
      logoEl.style.color = settings.logoNameColor === 'darkFont' ? '#000' : '#fff';
      const logoImg = logoEl.querySelector('img');
      if (logoImg) {
        if (settings.logoColor === 'light') logoImg.style.filter = 'brightness(100%)';
        else if (settings.logoColor === 'dark') logoImg.style.filter = 'brightness(50%)';
        else logoImg.style.filter = 'none';
      } else {
        console.warn('Logo resmi bulunamadı.');
      }
    } else {
      console.warn('Logo elementi bulunamadı.');
    }

    // Görünüm ayarları
    const toggleMap = {
      showFavorites: 'favoritesContainer',
      showSuggestions: 'suggestionsContainer',
      showWeather: 'weatherContainer',
      showInfoBar: 'infoBar',
      showSearch: 'searchContainer',
      showSearchShortcuts: 'shortcutsContainer',
      showAISearch: 'aiSearchContainer',
      showScienceSearch: 'scienceSearchContainer',
      showAccountButton: 'accountButton',
      showAccountInfoText: 'accountInfoText'
    };
    Object.entries(toggleMap).forEach(([settingKey, elId]) => {
      const el = $(elId);
      if (el) {
        el.style.display = settings[settingKey] === 'true' ? 'block' : 'none';
      } else {
        console.warn(`DOM elementi bulunamadı: ${elId}`);
      }
    });

    // Diğer ayarlar
    window.linkBehavior = settings.linkBehavior || defaultSettings.linkBehavior;
    window.multiSearchEnabled = settings.multiSearchEnabled === 'true';
    window.safeSearch = settings.safeSearchOptions === 'safeSearchEnable';
    window.disableSearchHistory = settings.disableSearchHistoryLog === 'disableSearchHistoryLogEnable';
    window.privateMode = settings.privateMode === 'privateModeEnable';

    // Arama motoru önizlemesi
    if (typeof options.updateSearchEnginePreview === 'function') options.updateSearchEnginePreview();

    // Arka plan
    if (typeof options.loadCachedBackground === 'function') {
      options.loadCachedBackground(settings.bgUrl || defaultSettings.bgUrl);
    } else {
      loadCachedBackground(settings.bgUrl || defaultSettings.bgUrl);
    }

    // Dil
    if (typeof options.updateLanguage === 'function') options.updateLanguage(settings.language || defaultSettings.language);

    // Favoriler
    if (typeof options.loadFavorites === 'function') options.loadFavorites(settings.maxFavorites || defaultSettings.maxFavorites);

    // Hava durumu
    if (typeof options.fetchWeather === 'function') options.fetchWeather();

    // Kısayollar
    if (typeof options.bindShortcuts === 'function') options.bindShortcuts();
    else bindShortcuts();

    // Hava durumu güncelleme
    if (typeof options.startWeatherUpdate === 'function') options.startWeatherUpdate();

    return settings;
  } catch (e) {
    console.error('applySettings hata:', e);
    return defaultSettings;
  }
}

// ------------------------- Settings Export / Import / Modal -------------------------
export function exportSettings() {
  const s = {};
  Object.keys(localStorage).forEach(k => s[k] = localStorage.getItem(k));
  return JSON.stringify(s, null, 2);
}

export function importSettings(settingsJson) {
  if (!settingsJson) return false;
  try {
    const settings = JSON.parse(settingsJson);
    Object.entries(settings).forEach(([k, v]) => {
      if (v !== undefined && v !== null) localStorage.setItem(k, v);
    });
    return true;
  } catch (e) {
    console.error("importSettings error:", e);
    return false;
  }
}

export function closeImportExportModal() {
  const m = $('importExportModal');
  if (m) m.style.display = 'none';
}

export function openImportExportModal() {
  const m = $('importExportModal');
  if (m) m.style.display = 'block';
}

// ------------------------- Settings Tarayıcı Sıfırlama -------------------------
export function resetBrowser() {
  try {
    // localStorage temizle
    localStorage.clear();

    // IndexedDB temizle
    if (window.indexedDB) {
      const req = indexedDB.deleteDatabase('fluxo_bg_db');
      req.onsuccess = () => console.log('IndexedDB silindi.');
      req.onerror = (e) => console.warn('IndexedDB silinemedi:', e);
    }

    // Arka planı sıfırla
    const videoElement = $('backgroundVideo');
    const youTubeElement = $('backgroundYouTube');
    if (videoElement) {
      videoElement.style.display = 'none';
      videoElement.pause?.();
      const source = videoElement.querySelector('source');
      if (source) source.src = '';
      videoElement.load?.();
    }
    if (youTubeElement) {
      youTubeElement.style.display = 'none';
      youTubeElement.src = '';
    }
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '';

    // Varsayılan ayarları uygula
    applySettings({
      updateSearchEnginePreview,
      loadCachedBackground,
      updateLanguage: window.updateLanguage,
      loadFavorites: window.loadFavorites,
      fetchWeather: window.fetchWeather,
      bindShortcuts,
      startWeatherUpdate: window.startWeatherUpdate
    });

    // Sayfayı yenile
    location.reload();
  } catch (e) {
    console.error('resetBrowser hata:', e);
  }
}

// ------------------------- Event Listeners -------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Uygula butonu
  $('applySettingsBtn')?.addEventListener('click', () => {
    if (saveSettingsFromInputs()) {
      alert('Ayarlar kaydedildi.');
    } else {
      alert('Ayarlar kaydedilemedi. Depolama alanınızı kontrol edin.');
    }
  });

  // Aktar/Al butonu
  $('importSettingsBtn')?.addEventListener('click', openImportExportModal);

  // Modal kapatma butonu
  $('closeImportExportModalBtn')?.addEventListener('click', closeImportExportModal);

  // Ayarları dışa aktar
  $('exportSettingsBtn')?.addEventListener('click', () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Ayarları içe aktar
  $('importSettingsBtnModal')?.addEventListener('click', () => {
    $('importFileInput')?.click();
  });
  $('importFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (importSettings(ev.target.result)) {
          applySettings({
            updateSearchEnginePreview,
            loadCachedBackground,
            updateLanguage: window.updateLanguage,
            loadFavorites: window.loadFavorites,
            fetchWeather: window.fetchWeather,
            bindShortcuts,
            startWeatherUpdate: window.startWeatherUpdate
          });
          alert('Ayarlar başarıyla içe aktarıldı.');
          closeImportExportModal();
        } else {
          alert('Ayarlar içe aktarılamadı. Geçerli bir JSON dosyası seçin.');
        }
      };
      reader.readAsText(file);
    }
  });

  // Arka plan dosya yükleme
  $('bgFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      await cacheBackgroundImage(url);
      safeSetItem('bgUrl', url);
      loadCachedBackground(url);
    }
  });

  // Tarayıcıyı sıfırla
  $('resetBrowserBtn')?.addEventListener('click', () => {
    if (confirm('Tüm ayarlar ve önbellek silinecek. Devam etmek istiyor musunuz?')) {
      resetBrowser();
    }
  });

  // Başlangıçta ayarları uygula
  applySettings({
    updateSearchEnginePreview,
    loadCachedBackground,
    updateLanguage: window.updateLanguage,
    loadFavorites: window.loadFavorites,
    fetchWeather: window.fetchWeather,
    bindShortcuts,
    startWeatherUpdate: window.startWeatherUpdate
  });
});

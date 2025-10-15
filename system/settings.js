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
  showBgRemove: "true",
  showWeather: "true",
  showInfoBar: "true",
  showSearch: "true",
  showSearchShortcuts: "true",
  showAISearch: "true",
  showAccountButton: "true",
  showAccountInfoText: "true",
  logoDisplay: "logo-name",
  logoPosition: "center",
  logoColor: "colored",
  showVoiceSearch: "true",
  showMultiSearch: "true",
  showLensSearch: "true",
  safeSearch: "true",  
  disableSearchHistoryLog: "false",
  privateMode: "false",
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
  supportShortcut: "Ctrl + Alt + S",
  weatherLocation: "",
  weatherUpdateInterval: "manual",
  linkBehavior: "newTab",
  multiSearchEnabled: "false",
  aiProvider: "chatgpt",
  customAiUrl: "",
  buttonDisplayMode: "text-only", 
};

// Global ayar cache'i (performans için)
let cachedSettings = null;

// Güvenli localStorage erişimi
function safeGetItem(key) {
  try { 
    const val = localStorage.getItem(key);
    return val !== null ? val : undefined;
  } catch (e) { 
    console.warn(`localStorage.getItem failed for ${key}:`, e);
    return undefined;
  }
}
function safeSetItem(key, value) {
  try { 
    localStorage.setItem(key, value); 
    return true; 
  } catch (e) { 
    console.warn(`localStorage.setItem failed for ${key}:`, e); 
    return false; 
  }
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
    let lang = safeGetItem('language') || 'tr';
    const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
    try { 
      alert(t.storageError || 'Depolama alanı dolu veya erişilemiyor. Lütfen tarayıcı ayarlarınızı kontrol edin.'); 
    } catch {}
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

// RGB'yi HEX'e dönüştür
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
  return s.replace(/\s*\+\s*/g, ' + ').trim().toUpperCase();  // Locale kaldırıldı
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
    ai: safeGetItem("aiShortcut") || defaultSettings.aiShortcut,
    support: safeGetItem("supportShortcut") || defaultSettings.supportShortcut  // Eksik ekle
  };

  Object.keys(shortcuts).forEach(k => { shortcuts[k] = _normalizeShortcut(shortcuts[k]); });

  const handleShortcuts = (e) => {
    if (!e || !e.key) return;
    const parts = [];
    if (e.ctrlKey) parts.push('CTRL');
    if (e.shiftKey) parts.push('SHIFT');
    if (e.altKey) parts.push('ALT');

    let keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key.replace(/^Arrow/, '').toUpperCase();
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
      } else if (keyCombo === shortcuts.support) {  // Eksik handler ekle
        e.preventDefault();
        const p = $('menuPanel');
        if (p) {
          p.style.display = p.style.display === "block" ? "none" : "block";
          document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
          $('supportContent')?.classList.add("active");
          document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
          document.querySelector(".tab-button[data-tab='support']")?.classList.add("active");
        }
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
      const reader = new Promise((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(blob);
      });
      safeSetItem(`bgCache_${url}`, await reader);
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
      const lang = safeGetItem('language') || 'tr';
      const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
      try { alert(t.invalidYouTube || 'Geçersiz YouTube URL\'si. Lütfen geçerli bir video bağlantısı girin.'); } catch {}
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
  if (elVal !== undefined) return elVal;
  const stored = safeGetItem(key);
  if (stored !== undefined) return stored;
  return defaultSettings[key] ?? '';
}

// Ayar cache'ini yükle
function loadCachedSettings() {
  if (cachedSettings) return cachedSettings;
  cachedSettings = {};
  Object.keys(defaultSettings).forEach(k => {
    const stored = safeGetItem(k);
    cachedSettings[k] = stored !== undefined ? stored : defaultSettings[k];
  });
  return cachedSettings;
}

export function saveSettings(settings) {
  if (!checkStorageAvailability()) return false;
  try {
    Object.entries(settings).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        safeSetItem(k, String(v));
        if (cachedSettings) cachedSettings[k] = String(v);  // Cache güncelle
      }
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
      supportShortcut: _normalizeShortcut(getSettingFromInputs('supportShortcut', 'supportShortcutInput')),  // Eksik ekle
      weatherLocation: getSettingFromInputs('weatherLocation', 'weatherLocation'),
      weatherUpdateInterval: getSettingFromInputs('weatherUpdateInterval', 'weatherUpdateInterval'),
      linkBehavior: getSettingFromInputs('linkBehavior', 'linkBehavior'),
      multiSearchEnabled: getSettingFromInputs('multiSearchEnabled', 'multiSearchEnabled'),
      aiProvider: getSettingFromInputs('aiProvider', 'aiProviderSelect'),
      customAiUrl: getSettingFromInputs('customAiUrl', 'customAiUrl'),
      showLensSearch: getSettingFromInputs('showLensSearch', 'showLensSearch'),
      showVoiceSearch: getSettingFromInputs('showVoiceSearch', 'showVoiceSearch'),
      showMultiSearch: getSettingFromInputs('showMultiSearch', 'showMultiSearch'),
      showBgRemove: getSettingFromInputs('showBgRemove', 'showBgRemove'),
      buttonDisplayMode: getSettingFromInputs('buttonDisplayMode', 'buttonDisplayMode'),
      // Tutarlı boolean'lar (select options'tan türet)
      safeSearch: getSettingFromInputs('safeSearchOptions', 'safeSearchOptions') === 'safeSearchEnable' ? 'true' : 'false',
      disableSearchHistoryLog: getSettingFromInputs('disableSearchHistoryLogOptions', 'disableSearchHistoryLogOptions') === 'disableSearchHistoryLogEnable' ? 'true' : 'false',
      privateMode: getSettingFromInputs('privateModeOptions', 'privateModeOptions') === 'privateModeEnable' ? 'true' : 'false',
    };

    saveSettings(settings);
    applySettings({
      updateSearchEnginePreview,
      loadCachedBackground,
      updateLanguage: typeof window.updateLanguage === 'function' ? window.updateLanguage : undefined,
      loadFavorites: typeof window.loadFavorites === 'function' ? window.loadFavorites : undefined,
      fetchWeather: typeof window.fetchWeather === 'function' ? window.fetchWeather : undefined,
      bindShortcuts,
      startWeatherUpdate: typeof window.startWeatherUpdate === 'function' ? window.startWeatherUpdate : undefined
    });
    // Font için reload kaldırıldı, canlı uygulanıyor
    // const currentFont = safeGetItem('font');
    // if (settings.font !== currentFont) {
    //   setTimeout(() => location.reload(true), 100);
    // }
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
      cachedSettings = { ...defaultSettings };
    } else {
      loadCachedSettings();  // Cache yükle
    }
    const settings = cachedSettings || { ...defaultSettings };

    const themeStylesheet = document.getElementById('themeStylesheet');
    if (themeStylesheet) {
        const systemTheme = settings.systemTheme || 'vanilla';
        themeStylesheet.href = `./styles/${systemTheme}.css`;
    }

    document.body.classList.remove('light', 'dark');
    if (settings.theme) document.body.classList.add(settings.theme);

    // Fontu uygula (sadece family)
    const fontFamily = settings.font || defaultSettings.font;
    document.documentElement.style.setProperty('--font-family', fontFamily, 'important');
    document.body.style.setProperty('font-family', fontFamily, 'important');

    // --- Eklendi: Google Fonts veya harici font linkini güncelle ---
    let fontLink = document.getElementById('fontStylesheet');
    if (fontLink) {
      // Sadece Google Fonts için uygula, ör: "'Open Sans', sans-serif"
      // Font adını ayıkla (tırnaksız ilk kelime)
      const match = fontFamily.match(/'([^']+)'/);
      const fontName = match ? match[1] : fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      // Google Fonts URL'si oluştur
      fontLink.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(fontName)}:400,700&display=swap`;
    }

    // Vurgu rengi
    selectColor(settings.accentColor || defaultSettings.accentColor);

    // Logo ayarları
    const logoEl = document.getElementById('logo');
    if (logoEl) {
        logoEl.style.display = settings.logoDisplay === 'none' ? 'none' : 'flex';
        logoEl.style.justifyContent = settings.logoPosition || 'flex-start';

        const logoImg = logoEl.querySelector('img');
        if (logoImg) {
            switch (settings.logoColor) {
                case 'light':
                    logoImg.src = 'assets/logo/logo-light.png';
                    break;
                case 'dark':
                    logoImg.src = 'assets/logo/logo-dark.png';
                    break;
                default:
                    logoImg.src = 'assets/logo/logo.png';
            }
            logoImg.style.filter = 'none';
        } else {
            console.warn('Logo resmi bulunamadı.');
        }
    } else {
        console.warn('Logo elementi bulunamadı.');
    }

    // Arama butonları görünümü
    const buttonMode = settings.buttonDisplayMode || defaultSettings.buttonDisplayMode;
    const buttonsEl = document.getElementById('buttons');
    if (buttonsEl) {
      buttonsEl.classList.remove('icons-only', 'text-only');
      
      if (buttonMode === 'icons-only') {
        buttonsEl.classList.add('icons-only');
      } else if (buttonMode === 'text-only') {
        buttonsEl.classList.add('text-only');
      }
    }

    // Direct style manipulation
    const buttonIcons = document.querySelectorAll('.buttons .accent .button-icon');
    const buttonTexts = document.querySelectorAll('.buttons .accent .button-text');

    buttonIcons.forEach(icon => {
      icon.style.display = (buttonMode === 'text-only') ? 'none' : 'inline-block';
    });

    buttonTexts.forEach(text => {
      text.style.display = (buttonMode === 'icons-only') ? 'none' : 'inline';
    });

    // Görünüm ayarları - Genişletilmiş toggleMap
    const toggleMap = {
      showFavorites: 'favorites',
      showSuggestions: 'suggestions',
      showWeather: 'weatherWidget',
      showInfoBar: 'infoBar',
      showSearch: 'searchBar',
      showSearchShortcuts: 'buttons',
      showAISearch: 'searchAIBtn',
      showScienceSearch: 'scienceSearchBtn',  // Eksik ekle
      showAccountButton: 'accountButton',
      showLensSearch: 'lensSearchBtn',
      showAccountInfoText: 'accountInfo',
      showVoiceSearch: 'voiceSearchBtn',
      showMultiSearch: 'multiSearchIcon',
      showBgRemove: 'removeBgBtn'  // Eksik ekle
    };
    Object.entries(toggleMap).forEach(([settingKey, elId]) => {
      const el = $(elId);
      if (el) {
        el.style.display = settings[settingKey] === 'true' ? '' : 'none';
      }
    });

    // Diğer ayarlar - Tutarlı okuma
    window.linkBehavior = settings.linkBehavior || defaultSettings.linkBehavior;
    window.multiSearchEnabled = settings.multiSearchEnabled === 'true';
    window.safeSearch = settings.safeSearch === 'true';  // Tutarlı boolean
    window.disableSearchHistory = settings.disableSearchHistoryLog === 'true';
    window.privateMode = settings.privateMode === 'true';

    // Arama motoru önizlemesi
    if (typeof options.updateSearchEnginePreview === 'function') options.updateSearchEnginePreview();

    // Arka plan
    if (typeof options.loadCachedBackground === 'function') {
      options.loadCachedBackground(settings.bgUrl || defaultSettings.bgUrl);
    } else {
      loadCachedBackground(settings.bgUrl || defaultSettings.bgUrl);
    }

    // Dil
    if (typeof options.updateLanguage === 'function') {
      options.updateLanguage(settings.language || defaultSettings.language);
    } else if (typeof window.updateLanguage === 'function') {
      window.updateLanguage(settings.language || defaultSettings.language);
    }

    // Favoriler
    if (typeof options.loadFavorites === 'function') {
      options.loadFavorites(settings.maxFavorites || defaultSettings.maxFavorites);
    } else if (typeof window.loadFavorites === 'function') {
      window.loadFavorites(settings.maxFavorites || defaultSettings.maxFavorites);
    }

    // Hava durumu
    if (typeof options.fetchWeather === 'function') {
      options.fetchWeather();
    } else if (typeof window.fetchWeather === 'function') {
      window.fetchWeather();
    }

    // Kısayollar
    if (typeof options.bindShortcuts === 'function') {
      options.bindShortcuts();
    } else {
      bindShortcuts();
    }

    // Hava durumu güncelleme
    if (typeof options.startWeatherUpdate === 'function') {
      options.startWeatherUpdate();
    } else if (typeof window.startWeatherUpdate === 'function') {
      window.startWeatherUpdate();
    }

    // Tema ikonlarını güncelle (loadTheme mantığını entegre et)
    loadThemeIcons(settings.theme || defaultSettings.theme);

    // --- Eklendi: Ayar inputlarını güncelle ---
    updateSettingsInputs(settings);

    return settings;
  } catch (e) {
    console.error('applySettings hata:', e);
    return defaultSettings;
  }
}

// Tema ikonlarını güncelle (loadTheme'den entegre)
function loadThemeIcons(theme) {
  const icons = {
    multiSearchIcon: theme === "dark" ? "assets/light/multisearch.png" : "assets/dark/multisearch-dark.png",
    voiceIcon: theme === "light" ? "assets/dark/mic-dark.png" : "assets/light/mic.png",
    menuIcon: theme === "light" ? "assets/dark/menu-dark.png" : "assets/light/menu.png",
    accountIcon: theme === "light" ? "assets/dark/account-dark.png" : "assets/light/account.png",
    lensIcon: theme === "light" ? "assets/dark/lens-dark.png" : "assets/light/lens.png"
  };

  Object.entries(icons).forEach(([id, src]) => {
    const el = document.getElementById(id);
    if (el) el.src = src;
  });

  // Tab ikonları
  const tabIcons = {
    settings: theme === "light" ? "assets/dark/settings-dark.png" : "assets/light/settings.png",
    history: theme === "light" ? "assets/dark/history-dark.png" : "assets/light/history.png",
    support: theme === "light" ? "assets/dark/support-dark.png" : "assets/light/support.png"
  };

  Object.entries(tabIcons).forEach(([tab, src]) => {
    const el = document.querySelector(`.tab-button[data-tab="${tab}"] img`);
    if (el) el.src = src;
  });

  // Arama buton ikonları
  const searchIcons = {
    searchWebBtn: theme === "light" ? "assets/dark/search-dark.png" : "assets/light/search.png",
    searchImagesBtn: theme === "light" ? "assets/dark/images-dark.png" : "assets/light/images.png",
    searchShoppingBtn: theme === "light" ? "assets/dark/shopping-dark.png" : "assets/light/shopping.png",
    searchNewsBtn: theme === "light" ? "assets/dark/news-dark.png" : "assets/light/news.png",
    searchAIBtn: theme === "light" ? "assets/dark/aisearch-dark.png" : "assets/light/aisearch.png"
  };

  Object.entries(searchIcons).forEach(([btnId, src]) => {
    const el = document.getElementById(btnId)?.querySelector('.button-icon');
    if (el) el.src = src;
  });

  // Select'i güncelle
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) themeSelect.value = theme;
}

// ------------------------- Settings Export / Import / Modal -------------------------
export function exportSettings() {
  // Sadece Fluxo anahtarlarını export et (temizlik)
  const s = {};
  Object.keys(defaultSettings).forEach(k => {
    const val = safeGetItem(k);
    if (val !== undefined) s[k] = val;
  });
  return JSON.stringify(s, null, 2);
}

export function importSettings(settingsJson) {
  if (!settingsJson) return false;
  try {
    const settings = JSON.parse(settingsJson);
    Object.entries(settings).forEach(([k, v]) => {
      if (defaultSettings.hasOwnProperty(k) && v !== undefined && v !== null) {
        safeSetItem(k, v);
        if (cachedSettings) cachedSettings[k] = v;
      }
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
    // localStorage ve sessionStorage temizle
    localStorage.clear();
    sessionStorage.clear();
    cachedSettings = null;  // Cache temizle

    // Cookies temizle
    document.cookie.split(";").forEach(cookie => {
      document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // IndexedDB tüm veritabanlarını sil (döngü ile)
    if (window.indexedDB) {
      const dbs = [];
      const req = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
      req.then(dbsList => {
        dbsList.forEach(db => indexedDB.deleteDatabase(db.name));
        console.log('IndexedDB veritabanları silindi.');
      }).catch(e => console.warn('IndexedDB listelenemedi:', e));
    }

    // Cache ve service worker temizle
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
        console.log('Cache silindi.');
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
        console.log('Service worker silindi.');
      });
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
      updateLanguage: typeof window.updateLanguage === 'function' ? window.updateLanguage : undefined,
      loadFavorites: typeof window.loadFavorites === 'function' ? window.loadFavorites : undefined,
      fetchWeather: typeof window.fetchWeather === 'function' ? window.fetchWeather : undefined,
      bindShortcuts,
      startWeatherUpdate: typeof window.startWeatherUpdate === 'function' ? window.startWeatherUpdate : undefined
    });

    // Sayfayı yenile (async tamamlandıktan sonra)
    setTimeout(() => location.reload(true), 500);  // Gecikme, temizleme bitsin
  } catch (e) {
    console.error('resetBrowser hata:', e);
    location.reload(true);  // Hata durumunda reload
  }
}

// ------------------------- Event Listeners -------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Uygula butonu
  $('applySettingsBtn')?.addEventListener('click', () => {
    if (saveSettingsFromInputs()) {
      console.log('Ayarlar kaydedildi ve uygulandı.');
    } else {
      console.warn('Ayarlar kaydedilemedi. Depolama alanınızı kontrol edin.');
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
            updateLanguage: typeof window.updateLanguage === 'function' ? window.updateLanguage : undefined,
            loadFavorites: typeof window.loadFavorites === 'function' ? window.loadFavorites : undefined,
            fetchWeather: typeof window.fetchWeather === 'function' ? window.fetchWeather : undefined,
            bindShortcuts,
            startWeatherUpdate: typeof window.startWeatherUpdate === 'function' ? window.startWeatherUpdate : undefined
          });
          const lang = safeGetItem('language') || 'tr';
          const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
          alert(t.settingsImported || 'Ayarlar başarıyla içe aktarıldı.');
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

  $('removeBgBtn')?.addEventListener('click', () => {
    if (confirm('Duvar kağıdı kaldırılacak. Devam?')) {
      safeSetItem('bgUrl', '');
      document.getElementById('bgUrlInput').value = '';
      loadCachedBackground('');
      alert('Duvar kağıdı kaldırıldı.');
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
    updateLanguage: typeof window.updateLanguage === 'function' ? window.updateLanguage : undefined,
    loadFavorites: typeof window.loadFavorites === 'function' ? window.loadFavorites : undefined,
    fetchWeather: typeof window.fetchWeather === 'function' ? window.fetchWeather : undefined,
    bindShortcuts,
    startWeatherUpdate: typeof window.startWeatherUpdate === 'function' ? window.startWeatherUpdate : undefined
  });
});

function updateSettingsInputs(settings) {
  // Text/select inputs
  const inputMap = {
    bgUrlInput: 'bgUrl',
    fontSelect: 'font',
    themeSelect: 'theme',
    systemThemeSelect: 'systemTheme',
    accentColor: 'accentColor',
    languageSelect: 'language',
    searchEngineSelect: 'searchEngine',
    logoDisplaySelect: 'logoDisplay',
    logoPositionSelect: 'logoPosition',
    logoColorSelect: 'logoColor',
    maxFavorites: 'maxFavorites',
    searchShortcutInput: 'searchShortcut',
    favoriteShortcutInput: 'favoriteShortcut',
    settingsShortcutInput: 'settingsShortcut',
    historyShortcutInput: 'historyShortcut',
    imagesShortcutInput: 'imagesShortcut',
    shoppingShortcutInput: 'shoppingShortcut',
    newsShortcutInput: 'newsShortcut',
    accountShortcutInput: 'accountShortcut',
    aiShortcutInput: 'aiShortcut',
    supportShortcutInput: 'supportShortcut',
    weatherLocation: 'weatherLocation',
    weatherUpdateInterval: 'weatherUpdateInterval',
    linkBehavior: 'linkBehavior',
    multiSearchEnabled: 'multiSearchEnabled',
    aiProviderSelect: 'aiProvider',
    customAiUrl: 'customAiUrl',
    buttonDisplayMode: 'buttonDisplayMode'
  };
  Object.entries(inputMap).forEach(([inputId, settingKey]) => {
    const el = document.getElementById(inputId);
    if (el && settings[settingKey] !== undefined) {
      el.value = settings[settingKey];
    }
  });

  // Checkbox/toggle inputs (as select or checkbox)
  const toggleIds = [
    'showFavorites', 'showSuggestions', 'showWeather', 'showInfoBar', 'showSearch',
    'showSearchShortcuts', 'showAISearch', 'showScienceSearch', 'showAccountButton',
    'showAccountInfoText', 'showLensSearch', 'showVoiceSearch', 'showMultiSearch', 'showBgRemove'
  ];
  toggleIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && settings[id] !== undefined) {
      // For checkbox
      if (el.type === 'checkbox') {
        el.checked = settings[id] === 'true';
      } else {
        el.value = settings[id];
      }
    }
  });

  // Special select options for boolean settings
  const safeSearchOptions = document.getElementById('safeSearchOptions');
  if (safeSearchOptions) {
    safeSearchOptions.value = settings.safeSearch === 'true' ? 'safeSearchEnable' : 'safeSearchDisable';
  }
  const disableSearchHistoryLogOptions = document.getElementById('disableSearchHistoryLogOptions');
  if (disableSearchHistoryLogOptions) {
    disableSearchHistoryLogOptions.value = settings.disableSearchHistoryLog === 'true' ? 'disableSearchHistoryLogEnable' : 'disableSearchHistoryLogDisable';
  }
  const privateModeOptions = document.getElementById('privateModeOptions');
  if (privateModeOptions) {
    privateModeOptions.value = settings.privateMode === 'true' ? 'privateModeEnable' : 'privateModeDisable';
  }
}

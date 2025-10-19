export function protectPages() {
    const allowedPages = ['', 'index.html', 'index', '404.html', '404'];
    let currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';

    if (currentPage.endsWith('.html')) {
        currentPage = currentPage.replace('.html', '');
    }

    const params = new URLSearchParams(window.location.search);

    // Hata ayıklama
    console.log('Current Page:', currentPage);
    console.log('Raw Pathname:', window.location.pathname);
    console.log('Referer:', document.referrer);
    console.log('User Agent:', navigator.userAgent);
    
    // XSS koruması
    const dangerousPatterns = [/<script/i, /javascript:/i, /onerror/i, /onload/i, /data:/i];
    if (params.has('q') || params.has('search')) {
        const query = params.get('q') || params.get('search');
        if (query && dangerousPatterns.some(pattern => pattern.test(query))) {
            window.location.href = '404.html';
            return;
        }
    }

    // Kullanıcı ajan kontrolü
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
        window.location.href = '404.html';
        return;
    }

    // Referer kontrolü
    const allowedReferers = [
        /^https:\/\/[a-zA-Z0-9-]+\.github\.io\/$/,
        /^https:\/\/github\.com\/$/,
        /^http:\/\/127\.0\.0\.1:5500\/$/
    ];
    const referer = document.refferer;
    if (referer && !allowedReferers.some(regex => regex.test(referer))) {
        window.location.href = '404.html';
        return;
    }

    // Sayfa kontrolü
    if (!allowedPages.includes(currentPage)) {
        console.log('Sayfa bulunamadı:', currentPage);
        window.location.href = '404.html';
    }
}

// API Güvenliği
export function validateApiKey(key, apiType) {
    if (!key || key.includes('<') || key.includes('>') || key.length < 10) {
        throw new Error(`Geçersiz ${apiType} API anahtarı`);
    }
    return key;
}

// API çağrısı wrapper
export async function secureFetch(url, options = {}) {
    const apiKey = localStorage.getItem('openWeatherMapApiKey') || '';
    validateApiKey(apiKey, 'Weather');
    const sanitizedUrl = url.replace(/<script|javascript:/gi, '');
    const res = await fetch(sanitizedUrl, { ...options, headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('API Hatası');
    return res;
}

// Uygunsuz kullanıcı adı kontrolü
export function isInappropriateUsername(username) {
    const badWords = [
        // İngilizce
        /(fuck|shit|bitch|asshole|damn|bastard|cunt|dick|prick|twat|wanker|bollocks|piss|wank|knob|tosser|git|slag|munter|chav|nonce|paedo|rapist|badass|terrorist)/gi,
        // Türkçe
        /(orospu|piç|siktir|amcık|yarrak|sik|am|avrat|karı|ibne|eşcinsel|lezbiyen|ananı|gay|avradını|sikiyim|sikerim|bok|siksem|amına|amk|ananı sikeyim|avradını siktir|piç kurusu|orospu çocuğu)/gi,
        // Fransızca
        /(merde|putain|salope|con|bite|chatte|enculé|bordel|connard|salopard)/gi,
        // Almanca
        /(scheiße|kacke|arsch|fotze|hurensohn|wichser|dreckssack|arschloch|mist|verdammt)/gi,
        // İspanyolca
        /(joder|coño|polla|concha|puta|maricón|cojones|cabrón|culero|chingar|pinche|pendejo)/gi,
        // Rusça (Cyrillic)
        /(блять|сука|хуй|пизда|ебать|пидор|мудак|нахуй|пошел на хуй|еб твою мать|пиздец|охуеть)/gi,
        // Japonca (Romaji/Kana)
        /(kuso|kusogaki|baka|ahou|chinpo|manji|unko|chinko)/gi,
        // Çince (Pinyin/Simplified)
        /(cào|bi|gǒu pì|tā mā de|shǐ|niǎo|jī bā|wáng bā dàn)/gi,
        // Korece (Hangul/Romaji)
        /(씨발|개새끼|병신|미친|존나|엠카이|씨팔|개쌔끼)/gi,
        // Arapça (Arabic script)
        /(كس|زب|طيز|عاهرة|لواط|قحبة|عاهر|طيزك|زبي|كسي)/gi,
        // Portekizce
        /(caralho|foda-se|porra|puta|filho da puta|vai tomar no cu|merda|vai se foder|cu|buceta)/gi,
        // İtalyanca
        /(cazzo|stronzo|puttana|fottiti|vaffanculo|culo|figa|troia)/gi,
        // İsveççe
        /(fan|helvete|jävlar|skit|djävul|kuk|fitta|hora)/gi,
        // Yunanca
        /(μαλακας|πουτανα|γάμησε|πούστης|αρχίδια|κλάσεις|κώλος|σκατά)/gi,
        // İbranice
        /(שמתי|קצוץ|זיין|כוס|זין|מזדיין|מזדיינת|אמהות|אונס|הומו)/gi,
        // Hintçe
        /(madarchod|behenchod|randi|chutiya|gaand|lavda|bhenchod|kutte|harami|chut|lund)/gi,
        // Moğolca
        /(хуа|бич|шарвага|хуян|ам|яри|пи)/gi
        //Portekizce
        /(Filhodaputa|Conas|Corno|Vai-tefoder|Chupa-mos)/gi,
    ];
    const lowerName = username.toLowerCase().trim();
    const validFormat = /^[a-zA-Z0-9_çğıöşüâêîôûàáèéìíòóùâãäåæçèéêëìíîïñòóôõöøùúûüýÿ\-]+$/.test(lowerName);
    const isValidLength = lowerName.length >= 3 && lowerName.length <= 20;
    const hasBadWord = badWords.some(regex => {
        const match = regex.test(lowerName);
        if (match) console.log(`Uygunsuz kelime tespit edildi: ${lowerName} -> ${regex}`);
        return match;
    });

    console.log(`Kullanıcı adı kontrolü: ${lowerName}, Geçerli format: ${validFormat}, Geçerli uzunluk: ${isValidLength}, Uygunsuz kelime: ${hasBadWord}`);

    return hasBadWord || !validFormat || !isValidLength;
}

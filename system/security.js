// ./system/security.js
export function protectPages() {
    const allowedPages = ['', 'index.html', '404.html'];
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const params = new URLSearchParams(window.location.search);

    // XSS koruması
    if (params.has('q') || params.has('search')) {
        const query = params.get('q') || params.get('search');
        if (query && (query.includes('<script') || query.includes('javascript:'))) {
            window.location.href = '404.html?reason=xss';
            return;
        }
    }

    // Kullanıcı ajan kontrolü
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
        window.location.href = '404.html?reason=bot';
        return;
    }

    // Referer kontrolü
    const allowedReferers = ['https://berat-365.github.io/fluxoDev/', 'https://berat-365.github.io/fluxoDev/', 'https://berat-365.github.io/', 'https://berat-365.github.io/fluxoDev/404.html', 'https://*.github.io/', 'https://github.com/', 'https://*.github.com/'];
    const referer = document.referrer;
    if (referer && !allowedReferers.some(ref => referer.startsWith(ref))) {
        window.location.href = '404.html?reason=unauthorized';
        return;
    }

    if (!allowedPages.includes(currentPage)) {
        window.location.href = '404.html?reason=notfound';
    }
}

// API Güvenliği
export function validateApiKey(key, apiType) {
    if (!key || key.includes('<') || key.includes('>') || key.length < 10) {
        throw new Error(`Invalid ${apiType} API key`);
    }
    return key;
}

// API çağrısı wrapper
export async function secureFetch(url, options = {}) {
    const apiKey = localStorage.getItem('openWeatherMapApiKey') || '';
    validateApiKey(apiKey, 'Weather');
    const sanitizedUrl = url.replace(/<script|javascript:/gi, '');
    const res = await fetch(sanitizedUrl, { ...options, headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('API Error');
    return res;
}

// Uygunsuz kullanıcı adı kontrolü
export function isInappropriateUsername(username) {
    const badWords = [
        // İngilizce (mevcut + ek)
        /fuck|shit|bitch|asshole|damn|bastard|cunt|dick|prick|twat|wanker|bollocks|piss|wank|knob|tosser|git|slag|munter|chav|nonce|paedo|rapist|terrorist|kill|die|suicide|rape|molest|pedo|racist|sexist|homophobe|nazi|hitler|stalin|maos|genocide|holocaust|slave|whore|prostitute|drug|heroin|coke|meth|crack|ecstasy|lsd|weed|pot|ganja|blowjob|handjob|cunnilingus|fellatio|anal|orgasm|climax|cum|ejaculate|masturbate|porn|xxx|sex|orgy|gangbang|bdsm|fetish|sado|masoch|voyeur|exhibitionist|incest|bestiality|necrophilia|coprophilia|urophilia|pederast|ephebophile|hebephile|teleiophile|autogynephilia|transvestite|tranny|she-male|ladyboy|hermaphrodite|intersex|asexual|bisexual|pansexual|polyamory|swinger|openrelationship|threesome|foursome|orgasmic|clitoral|vaginal|oral|penis|vagina|clitoris|labia|vulva|testicles|scrotum|foreskin|circumcise|erection|ejaculation|menstruation|ovulation|impregnate|abort|miscarry|stillborn|infanticide|childabuse|domesticviolence|abuse|molestation|harassment|stalking|cyberbullying|hatecrime|lynching|gaschamber|concentrationcamp|ethniccleansing|warcrime|genocidal|massmurder|serialkiller|psychopath|sociopath|antisocial|borderline|narcissist|schizophrenic|bipolar|depressed|anxious|ocd|ptsd|adhd|autistic|downsyndrome|mentalretard|idiot|moron|imbecile|cretin|retard|spastic|crazy|insane|mad|lunatic|psycho|nutjob|loony|fruitcake|batshit|headcase|looney|psychotic|delusional|paranoid|manic|depressive|suicidal|selfharm|cutting|burning|anorexic|bulimic|obese|fatass|skinny|anorexia|bulimia|binge|purge|overeat|undereat|diet|calorie|fasting|starvation|vomiting|laxative|diuretic|steroid|anabolic|testosterone|estrogen|hormone|transgender|cisgender|nonbinary|genderqueer|agender|bigender|pangender|demigender|genderfluid|genderflux|androgynous|intergender|thirdgender|twospirit|faaf|maab|ftm|mtf|transman|transwoman|enby|douchebag|bell-end/gi,
        // Türkçe
        /orospu|piç|siktir|amcık|yarrak|sik|am|avrat|karı|ibne|eşcinsel|lezbiyen|ananı|avradını|sikiyim|sikerim|siksem|amına|amk|amına koyayım|ananı sikeyim|avradını siktir|piç kurusu|orospu çocuğu|ananı sikeyim|ağzına sıçarım|amına koyim|siktir git|amk malk|amk lan|ananı sikeyim|avradını siktir|piç kurusu|orospu çocuğu/gi,
        // Fransızca
        /merde|putain|salope|con|bite|chatte|enculé|bordel|vas te faire foutre|baise moi|putain de merde|connard|salopard|enculer|putier|salop|chier|merdasse|connasse/gi,
        // Almanca
        /scheiße|kacke|arsch|fotze|hurensohn|wichser|dreckssack|arschloch|mist|verdammt|verpiss dich|fick dich|fotzenlecker|arschfick|kackbratwurst|korinthenkacker|hackfresse|arschgeige|evolutionsbremse/gi,
        // İspanyolca
        /joder|coño|polla|concha|puta|maricón|cojones|cabrón|culero|chingar|pinche|pendejo|culicagado|tocapelotas|pagafantas|me cago en|que te folle un pez|tu puta madre/gi,
        // Rusça (Cyrillic)
        /блять|сука|хуй|пизда|ебать|пидор|мудак|нахуй|пошел на хуй|еб твою мать|пиздец|охуеть|заебал|напиздел|конь в пальто|перхоть подзалупная|хуй с горы|чтоб тебе дети в суп срали/gi,
        // Japonca (Romaji/Kana)
        /kuso|kusogaki|baka|ahou|chin chin|omae|dame|iyagarase|chinpo|manji|bakamono|unko|chinko|chinpo|kuso|kuso kurae|shine|doufu no kado ni atama buttsukete shine/gi,
        // Çince (Pinyin/Simplified)
        /cào|bi|gǒu pì|tā mā de|shǐ|niǎo|jī bā|wáng bā dàn|chòu nǚ rén|gǒu rì de|shǎ guā|chòu bī|niǎo xī|biàn jiāng|shǐ tóu|niǎo bāo|jī bā|wáng bā|tā mā|bi|zǒu kāi/gi,
        // Korece (Hangul/Romaji)
        /씨발|개새끼|병신|미친|존나|엠카이|씨팔|개새끼야|병신같은|미친 새끼|씨발놈|개쌔끼|씨발|병신|개새끼|존나|엠카이|씨팔놈|개새끼야/gi,
        // Arapça (Arabic script)
        /كس|زب|طيز|عاهرة|لواط|يَقْذِف|مَمْلُوك|مُسْتَقِم|قَحْبَة|عَاهِر|طِيزَك|زُبِّي|كُسِّي|يَكْسَك|عَاهِرَة|لُوطِيّ|مَحْشَش|مُخْدِر|مُتَحَرِّش|مُسْتَفْزِز/gi,
        // Portekizce
        /caralho|foda-se|porra|puta|filho da puta|vai tomar no cu|merda|vai se foder|cu|buceta|piu|viado|traveco|putinha|arrombado|caralho|porra que pariu|foda-se|filho da puta/gi,
        // İtalyanca
        /cazzo|stronzo|puttana|fottiti|vaffanculo|porca madonna|culo|figa|troia|rompicoglioni|testa di cazzo|leccaculo|rompi palle|porca troia|vaffanculo/gi,
        // İsveççe
        /fan|helvete|jävlar|skit|djävul|kuk|fitta|hora|skitstövel|jävla|fan i helvete|helvetes|skitkul|jävlig|helvete|fan ta dig/gi,
        // Yunanca
        /μαλακας|πουτανα|γάμησε|πούστης|αρχίδια|κλάσεις|αρχίδια|μαλάκας|πούστης|γάμησε|πουτάνα|κώλος|σκατά|βυζιά|κυνηγεσία/gi,
        // İbranice
        /שמתי|קצוץ|זיין|כוס|זין|מזדיין|מזדיינת|אמהות|אונס|הומו|טרנס|פדו|נאצי|שואה|גזעני/gi,
        // Hintçe
        /madarchod|behenchod|randi|chutiya|gaand|lavda|bhenchod|madarchod|kutte|harami|chut|lund|bhootni ke|bhoot|madarchod/gi,
        // Moğolca (az, basit)
        /хуа|бич|шарвага|хуян|ам|яри|пи|хуа|хуян|шарвага/gi
    ];
    const lowerName = username.toLowerCase().trim();
    return badWords.some(regex => regex.test(lowerName)) || lowerName.length < 3 || lowerName.length > 20 || !/^[a-zA-Z0-9_çğıöşüâêîôûàáèéìíòóùâãäåæçèéêëìíîïñòóôõöøùúûüýÿ\-]+$/.test(lowerName); // Türkçe karakterler eklendi
}

// Sayfa yüklendikten sonra çalıştır
document.addEventListener('DOMContentLoaded', () => {
    protectPages();

});

